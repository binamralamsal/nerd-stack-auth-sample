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
          const userId = getUserFromAccessToken(accessToken);

          return { user: null, userId };
        }

        const user = await refreshTokens({ accessToken, refreshToken });
        return { user, userId: user.id };
      } catch {
        throw new UnauthorizedError();
      }
    },
  );
