import { db } from "../../drizzle/db";
import { sessionsTable, usersTable } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";

export async function registerUser(data: {
  email: string;
  name: string;
  password: string;
}) {
  const hashedPassword = await Bun.password.hash(data.password);

  return await db
    .insert(usersTable)
    .values({
      ...data,
      password: hashedPassword,
    })
    .returning();
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

  return await db
    .insert(sessionsTable)
    .values({
      sessionToken,
      userId,
      userAgent: connection.userAgent,
      ip: connection.ip,
    })
    .returning();
}
