import { Elysia } from "elysia";

import { HTTPError } from "#errors/http-error";
import { UnauthorizedError } from "#errors/unauthorized-error";
import { auth } from "#middlewares/auth.middleware";
import { setup } from "#setup";

import {
  authorizeUserDTO,
  changePasswordDTO,
  registerUserDTO,
  verifyUserDTO,
} from "./auth.dtos";
import {
  authorizeUser,
  createSession,
  findUserById,
  verifyPassword,
  logoutUser,
  logUserIn,
  registerUser,
  sendVerifyEmailLink,
  validateVerifyEmail,
  changePassword,
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

      sendVerifyEmailLink(email, userId);

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
      body: registerUserDTO,
      detail: {
        tags: ["Auth"],
      },
    },
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
      const userId = await authorizeUser(body);

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
      body: authorizeUserDTO,
      detail: {
        tags: ["Auth"],
      },
    },
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
    },
  )

  .use(auth)
  .post(
    "/verify",
    async ({ userId, body }) => {
      await validateVerifyEmail({ ...body, userId });

      return "Your email address has been verified!";
    },
    {
      body: verifyUserDTO,
    },
  )
  .get("/me", () => "Hello you")
  .post(
    "/change-password",
    async ({ body: { newPassword, oldPassword }, user, userId }) => {
      if (newPassword === oldPassword)
        throw new HTTPError("New password can't be same as old password", 400);

      const currentUser = user || (await findUserById(userId));

      if (!currentUser) throw new UnauthorizedError();

      const isAuthorized = await verifyPassword(
        oldPassword,
        currentUser.password,
      );

      if (!isAuthorized)
        throw new HTTPError("Old password that you entered is incorrect", 401);

      await changePassword(userId, newPassword);

      return "Password changed successfully!";
    },
    {
      body: changePasswordDTO,
    },
  );
