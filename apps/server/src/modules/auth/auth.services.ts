import crypto from "node:crypto";

import type { JWTPayloadSpec } from "@elysiajs/jwt";
import { and, eq } from "drizzle-orm";
import type { Cookie } from "elysia";
import postgres from "postgres";

import { env } from "#config/env";
import { db } from "#drizzle/db";
import { sessionsTable, usersTable } from "#drizzle/schema";
import { HTTPError } from "#errors/http-error";
import { UnauthorizedError } from "#errors/unauthorized-error";
import type { JWT } from "#types";

import { accessTokenDTO, refreshTokenDTO } from "./auth.dtos";

// eslint-disable-next-line import/no-named-as-default-member -- You can't destructure postgres directly
const { PostgresError } = postgres;

export async function registerUser(data: {
  email: string;
  name: string;
  password: string;
}) {
  const hashedPassword = await Bun.password.hash(data.password);

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

  if (!currentUser) return { isAuthorized: false, userId: null } as const;

  const isAuthorized = await Bun.password.verify(
    data.password,
    currentUser.password
  );

  return {
    isAuthorized,
    userId: currentUser.id,
  };
}

export async function createSession(
  userId: number,
  connection: { ip: string; userAgent: string }
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

export async function logUserIn({
  jwt,
  accessToken,
  refreshToken,
  sessionId,
  userId,
}: {
  jwt: JWT;
  accessToken: Cookie<any>;
  refreshToken: Cookie<any>;
  sessionId: number;
  userId: number;
}) {
  const SECONDS_PER_MINUTE = 60;
  const MINUTES_PER_HOUR = 60;
  const HOURS_PER_DAY = 24;
  const DAYS_PER_MONTH = 30;

  const accessTokenExpiry = SECONDS_PER_MINUTE;
  const refreshTokenExpiry =
    DAYS_PER_MONTH * HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE;

  accessToken.set({
    value: await jwt.sign({
      sessionId,
      userId,
      exp: accessTokenExpiry,
    }),
    maxAge: accessTokenExpiry,
  });
  refreshToken.set({
    value: await jwt.sign({ sessionId, exp: refreshTokenExpiry }),
    maxAge: refreshTokenExpiry,
  });
}

export async function logoutUser(
  refreshToken: Record<string, string | number> & JWTPayloadSpec,
  accessTokenCookie: Cookie<any>,
  refreshTokenCookie: Cookie<any>
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

export async function getUserFromAccessToken(
  accessToken: Cookie<any>,
  jwt: JWT
) {
  const decodedAccessToken = await jwt.verify(accessToken.value);

  if (!decodedAccessToken) throw new UnauthorizedError();
  const validatedAccessToken = accessTokenDTO.parse(decodedAccessToken);

  return validatedAccessToken.userId;
}

export async function refreshTokens({
  jwt,
  refreshToken,
  accessToken,
}: {
  jwt: JWT;
  accessToken: Cookie<any>;
  refreshToken: Cookie<any>;
}) {
  const decodedRefreshToken = await jwt.verify(refreshToken.value);
  if (!decodedRefreshToken) throw new UnauthorizedError();

  const validatedRefreshToken = refreshTokenDTO.parse(decodedRefreshToken);
  const currentSession = await findSessionById(validatedRefreshToken.sessionId);

  if (!currentSession?.valid) throw new UnauthorizedError();

  const user = await findUserById(currentSession.userId);
  if (!user) throw new UnauthorizedError();

  await logUserIn({
    jwt,
    accessToken,
    refreshToken,
    sessionId: currentSession.id,
    userId: user.id,
  });

  return user;
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
  console.log(emailToken, token);
  const isValid = emailToken === token;

  if (!isValid) throw new HTTPError("Your verification link is invalid!", 401);

  await db
    .update(usersTable)
    .set({ emailVerified: true })
    .where(and(eq(usersTable.id, userId), eq(usersTable.email, email)));
}
