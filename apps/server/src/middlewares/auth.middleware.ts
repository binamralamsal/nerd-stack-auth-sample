import { Elysia } from "elysia";

import { UnauthorizedError } from "#errors/unauthorized-error";
import {
  getUserFromAccessToken,
  refreshTokens,
} from "#modules/auth/auth.services";
import { setup } from "#setup";

export const auth = new Elysia({
  name: "auth",
})
  .use(setup)
  .derive(
    { as: "global" },
    async ({ cookie: { accessToken, refreshToken } }) => {
      try {
        if (accessToken.value) {
          const { userId, sessionId } = getUserFromAccessToken(accessToken);

          return { user: null, userId, sessionId };
        }

        const { user, sessionId } = await refreshTokens({
          accessToken,
          refreshToken,
        });
        return { user, sessionId, userId: user.id };
      } catch {
        throw new UnauthorizedError();
      }
    },
  );
