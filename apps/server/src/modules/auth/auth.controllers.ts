import { VerifyEmailLink } from "@repo/email";
import { Elysia } from "elysia";

import { HTTPError } from "#errors/http-error";
import { UnauthorizedError } from "#errors/unauthorized-error";
import { logger } from "#libs/pino";
import { auth } from "#middlewares/auth.middleware";
import { sendEmail } from "#services/send-email";
import { setup } from "#setup";

import {
  authorizeUserValidator,
  registerUserValidator,
  verifyUserValidator,
} from "./auth.dtos";
import {
  authorizeUser,
  createSession,
  createVerifyEmailLink,
  logoutUser,
  logUserIn,
  registerUser,
  validateVerifyEmail,
} from "./auth.services";

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
      const { id: userId, email } = await registerUser(body);
      const { id: sessionId } = await createSession(userId, {
        ip,
        userAgent: headers["user-agent"] || "",
      });

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

      await logUserIn({
        jwt,
        accessToken,
        refreshToken,
        sessionId,
        userId,
      });

      set.status = 201;
      return "Registered User Successfully";
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
    async ({ cookie: { refreshToken, accessToken }, jwt }) => {
      const decodedRefreshToken = await jwt.verify(refreshToken.value);
      if (!decodedRefreshToken) throw new UnauthorizedError();

      await logoutUser(decodedRefreshToken, accessToken, refreshToken);

      return "Logged out successfully!";
    },
    {
      detail: {
        tags: ["Auth"],
      },
    }
  )

  .use(auth)
  .post(
    "/verify",
    async ({ userId, body }) => {
      await validateVerifyEmail({ ...body, userId });

      return "Your email address has been verified!";
    },
    {
      body: verifyUserValidator,
    }
  )
  .get("/me", () => "Hello you");
