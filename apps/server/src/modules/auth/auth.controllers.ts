import {
  authorizeUser,
  createSession,
  logoutUser,
  logUserIn,
  refreshTokens,
  registerUser,
} from "./auth.services";
import { authorizeUserValidator, registerUserValidator } from "./auth.dtos";
import Elysia, { t } from "elysia";
import { setup } from "../../setup";
import { STATUS } from "../../types";
import { auth } from "../../middlewares/auth.middleware";
import { HTTPError } from "../../errors/http-error";
import { UnauthorizedError } from "../../errors/unauthorized-error";

export const authControllers = new Elysia({
  prefix: "/auth",
})
  .use(setup)

  .post(
    "/register",
    async ({
      body,
      ip,
      headers,
      jwt,
      set,
      cookie: { accessToken, refreshToken },
    }) => {
      const { id: userId } = await registerUser(body);
      const { id: sessionId } = await createSession(userId, {
        ip,
        userAgent: headers["user-agent"] || "",
      });

      await logUserIn({
        jwt,
        accessToken,
        refreshToken,
        sessionId,
        userId,
      });

      set.status = 201;
      return {
        message: "Registered User Successfully",
        status: STATUS.SUCCESS,
      };
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
      headers,
      jwt,
      cookie: { accessToken, refreshToken },
    }) => {
      const { isAuthorized, userId } = await authorizeUser(body);

      if (!isAuthorized || !userId)
        throw new HTTPError("Invalid username or password", 401);

      const { id: sessionId } = await createSession(userId, {
        ip,
        userAgent: headers["user-agent"] || "",
      });

      await logUserIn({
        jwt,
        accessToken,
        refreshToken,
        sessionId,
        userId,
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
      if (!decodedRefreshToken) throw new UnauthorizedError();

      await logoutUser(decodedRefreshToken, accessToken, refreshToken);

      return { message: "Logged out successfully!", status: STATUS.SUCCESS };
    },
    {
      detail: {
        tags: ["Auth"],
      },
    }
  )

  .use(auth)
  .get("/me", () => "Hello you");
