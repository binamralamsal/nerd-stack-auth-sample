import { JWTPayloadSpec } from "@elysiajs/jwt";
import { db } from "../../drizzle/db";
import { sessionsTable, usersTable } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";
import { refreshTokenDTO } from "./auth.dtos";
import { Cookie } from "elysia";
import { JWT } from "../../types";
import postgres from "postgres";
import { HTTPError } from "../../errors/http-error";

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
  accessToken.set({
    value: await jwt.sign({ sessionId: sessionId, userId, exp: 60 }),
    maxAge: 60,
  });
  refreshToken.set({
    value: await jwt.sign({ sessionId: sessionId }),
    maxAge: 30 * 24 * 60 * 60,
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

export async function findUserById(userId: number) {
  return await db.query.usersTable.findFirst({
    where: eq(usersTable.id, userId),
  });
}

export async function findSessionById(sessionId: number) {
  return await db.query.sessionsTable.findFirst({
    where: eq(sessionsTable.id, sessionId),
  });
}
