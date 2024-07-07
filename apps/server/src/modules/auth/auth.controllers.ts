import { authorizeUser, createSession, registerUser } from "./auth.services";
import {
  authorizeUserValidator,
  refreshTokenDTO,
  registerUserValidator,
} from "./auth.dtos";
import Elysia, { t } from "elysia";
import postgres from "postgres";
import { setup } from "../../setup";
import { db } from "../../drizzle/db";
import { eq } from "drizzle-orm";
import { sessionsTable } from "../../drizzle/schema";
import { STATUS } from "../../types";
import { env } from "process";

const { PostgresError } = postgres;

export const authControllers = new Elysia()
  .use(setup)

  .post(
    "/register",
    async ({ body, error }) => {
      try {
        await registerUser(body);

        return {
          message: "Registered User Successfully",
          status: STATUS.SUCCESS,
        };
      } catch (err) {
        if (err instanceof PostgresError && err.code === "23505") {
          return error(401, {
            error: "User with that Email address already exists",
            status: STATUS.ERROR,
          });
        }

        throw err;
      }
    },
    {
      body: registerUserValidator,
      detail: {
        tags: ["Auth"],
      },
    }
  )

  .post(
    "/authorize",
    async ({
      body,
      ip,
      error,
      headers,
      jwt,
      cookie: { accessToken, refreshToken },
    }) => {
      const { isAuthorized, userId } = await authorizeUser(body);

      if (!isAuthorized || !userId)
        return error(401, {
          error: "Invalid username or password",
          status: STATUS.ERROR,
        });

      const connectionInformation = {
        ip,
        userAgent: headers["user-agent"] || "",
      };
      const session = (await createSession(userId, connectionInformation))[0];

      accessToken.set({
        value: await jwt.sign({ sessionId: session.id, userId }),
      });
      refreshToken.set({
        value: await jwt.sign({ sessionId: session.id }),
        maxAge: 30 * 24 * 60 * 60,
      });
      return {
        message: "Authorized User Successfully",
        status: STATUS.SUCCESS,
        userId,
      };
    },
    {
      body: authorizeUserValidator,
      detail: {
        tags: ["Auth"],
      },
      secrets: env.COOKIE_SIGNATURE,
      sign: ["accessToken", "refreshToken"],
    }
  )

  .post(
    "/logout",
    async ({ cookie: { refreshToken, accessToken }, jwt }) => {
      const decodedRefreshToken = await jwt.verify(refreshToken.value);
      console.log(decodedRefreshToken);
      const validatedRefreshToken = refreshTokenDTO.parse(decodedRefreshToken);

      await db
        .delete(sessionsTable)
        .where(eq(sessionsTable.id, validatedRefreshToken.sessionId));
      refreshToken.remove();
      accessToken.remove();

      return { message: "Logged out successfully!", status: STATUS.SUCCESS };
    },
    {
      cookie: "tokenCookie",
      detail: {
        tags: ["Auth"],
      },
      secrets: env.COOKIE_SIGNATURE,
      sign: ["accessToken", "refreshToken"],
    }
  );
