import crypto from "node:crypto";

import { VerifyEmailLink } from "@repo/email";
import { and, eq } from "drizzle-orm";
import type { Cookie } from "elysia";
import { sign, verify, type JwtPayload } from "jsonwebtoken";
import postgres from "postgres";

import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from "#config/constants";
import { env } from "#config/env";
import { db } from "#drizzle/db";
import { sessionsTable, usersTable } from "#drizzle/schema";
import { HTTPError } from "#errors/http-error";
import { UnauthorizedError } from "#errors/unauthorized-error";
import { logger } from "#libs/pino";
import { sendEmail } from "#services/send-email";

import { accessTokenDTO, refreshTokenDTO } from "./auth.dtos";

// eslint-disable-next-line import/no-named-as-default-member -- You can't destructure postgres directly
const { PostgresError } = postgres;

export function hashPassword(password: string) {
  return Bun.password.hash(password);
}

export function verifyPassword(password: string, hashedPassword: string) {
  return Bun.password.verify(password, hashedPassword);
}

export async function registerUser(data: {
  email: string;
  name: string;
  password: string;
}) {
  const hashedPassword = await hashPassword(data.password);

  try {
    return (
      await db
        .insert(usersTable)
        .values({
          ...data,
          password: hashedPassword,
        })
        .returning()
    )[0];
  } catch (err) {
    if (err instanceof PostgresError && err.code === "23505") {
      throw new HTTPError("User with that Email address already exists", 409);
    }

    throw err;
  }
}

export async function authorizeUser(data: { email: string; password: string }) {
  const currentUser = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, data.email),
  });

  const errorMessage = "Invalid username or password";

  if (!currentUser) throw new HTTPError(errorMessage, 401);

  const isAuthorized = await verifyPassword(
    data.password,
    currentUser.password,
  );

  if (!isAuthorized) throw new HTTPError(errorMessage, 401);

  return currentUser.id;
}

export async function createSession(
  userId: number,
  connection: { ip: string; userAgent: string },
) {
  const sessionToken = crypto.randomBytes(45).toString("hex");

  return (
    await db
      .insert(sessionsTable)
      .values({
        sessionToken,
        userId,
        userAgent: connection.userAgent,
        ip: connection.ip,
      })
      .returning()
  )[0];
}

export function logUserIn({
  accessToken,
  refreshToken,
  sessionId,
  userId,
}: {
  accessToken: Cookie<any>;
  refreshToken: Cookie<any>;
  sessionId: number;
  userId: number;
}) {
  const now = Math.floor(Date.now() / 1000);

  accessToken.set({
    value: sign(
      {
        sessionId,
        userId,
        exp: now + ACCESS_TOKEN_EXPIRY,
      },
      env.JWT_SECRET,
    ),
    maxAge: ACCESS_TOKEN_EXPIRY,
  });
  refreshToken.set({
    value: sign({ sessionId, exp: now + REFRESH_TOKEN_EXPIRY }, env.JWT_SECRET),
    maxAge: REFRESH_TOKEN_EXPIRY,
  });
}

export async function logoutUser(
  refreshToken: string | JwtPayload,
  accessTokenCookie: Cookie<any>,
  refreshTokenCookie: Cookie<any>,
) {
  const validatedRefreshToken = refreshTokenDTO.parse(refreshToken);

  await db
    .delete(sessionsTable)
    .where(eq(sessionsTable.id, validatedRefreshToken.sessionId));
  accessTokenCookie.remove();
  refreshTokenCookie.remove();
}

export function findUserById(userId: number) {
  return db.query.usersTable.findFirst({
    where: eq(usersTable.id, userId),
  });
}

export function findSessionById(sessionId: number) {
  return db.query.sessionsTable.findFirst({
    where: eq(sessionsTable.id, sessionId),
  });
}

export function getUserFromAccessToken(accessToken: Cookie<any>) {
  try {
    const decodedAccessToken = verify(accessToken.value, env.JWT_SECRET);

    const validatedAccessToken = accessTokenDTO.parse(decodedAccessToken);

    return validatedAccessToken.userId;
  } catch {
    throw new UnauthorizedError();
  }
}

export async function refreshTokens({
  refreshToken,
  accessToken,
}: {
  accessToken: Cookie<any>;
  refreshToken: Cookie<any>;
}) {
  try {
    const decodedRefreshToken = verify(refreshToken.value, env.JWT_SECRET);

    const validatedRefreshToken = refreshTokenDTO.parse(decodedRefreshToken);
    const currentSession = await findSessionById(
      validatedRefreshToken.sessionId,
    );

    if (!currentSession?.valid) throw new UnauthorizedError();

    const user = await findUserById(currentSession.userId);
    if (!user) throw new UnauthorizedError();

    logUserIn({
      accessToken,
      refreshToken,
      sessionId: currentSession.id,
      userId: user.id,
    });

    return user;
  } catch {
    throw new UnauthorizedError();
  }
}

export function createVerifyEmailToken(email: string, userId: number) {
  const authString = `${env.JWT_SECRET}:${email}:${userId}`;
  return crypto.createHash("sha256").update(authString).digest("hex");
}

export function createVerifyEmailLink(email: string, userId: number) {
  const emailToken = createVerifyEmailToken(email, userId);
  const uriEncodedEmail = encodeURIComponent(email);

  return `${env.FRONTEND_DOMAIN_WITH_PROTOCOL}/verify?token=${emailToken}&email=${uriEncodedEmail}`;
}

export async function validateVerifyEmail({
  email,
  userId,
  token,
}: {
  token: string;
  email: string;
  userId: number;
}) {
  const emailToken = createVerifyEmailToken(email, userId);
  const isValid = emailToken === token;

  if (!isValid) throw new HTTPError("Your verification link is invalid!", 400);

  await db
    .update(usersTable)
    .set({ emailVerified: true })
    .where(and(eq(usersTable.id, userId), eq(usersTable.email, email)));
}

export function sendVerifyEmailLink(email: string, userId: number) {
  const emailLink = createVerifyEmailLink(email, userId);
  sendEmail({
    from: "Auth Sample <binamralamsal@resend.dev>",
    to: [email],
    subject: "Verify your Email",
    react: VerifyEmailLink({ url: emailLink }),
  })
    .then(({ data, error }) => {
      if (data) return null;
      if (error) throw new Error(error.message);
    })
    .catch(logger.error);
}

export async function changePassword(userId: number, newPassword: string) {
  const hashedPassword = await hashPassword(newPassword);

  return db
    .update(usersTable)
    .set({
      password: hashedPassword,
    })
    .where(eq(usersTable.id, userId));
}
