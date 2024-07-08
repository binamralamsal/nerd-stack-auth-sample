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
import { env } from "../../config/env";
import { auth } from "../../middlewares/auth.middleware";

const { PostgresError } = postgres;

export const authControllers = new Elysia({
  prefix: "/auth",
})
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
        maxAge: 60,
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
    }
  )

  .post(
    "/logout",
    async ({ cookie: { refreshToken, accessToken }, jwt, error }) => {
      const decodedRefreshToken = await jwt.verify(refreshToken.value);
      if (!decodedRefreshToken)
        return error(401, {
          error: "User is not logged in",
          status: STATUS.ERROR,
        });

      const validatedRefreshToken = refreshTokenDTO.parse(decodedRefreshToken);

      await db
        .delete(sessionsTable)
        .where(eq(sessionsTable.id, validatedRefreshToken.sessionId));
      refreshToken.remove();
      accessToken.remove();

      return { message: "Logged out successfully!", status: STATUS.SUCCESS };
    },
    {
      detail: {
        tags: ["Auth"],
      },
    }
  )
  .guard({}, (app) => app.use(auth).get("/me", () => "Hello you"));
