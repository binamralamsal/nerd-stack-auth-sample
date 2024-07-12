import Elysia from "elysia";
import { setup } from "../setup";
import { UnauthorizedError } from "../errors/unauthorized-error";
import {
  getUserFromAccessToken,
  refreshTokens,
} from "../modules/auth/auth.services";

export const auth = new Elysia({ name: "auth" })
  .use(setup)
  .derive(
    { as: "global" },
    async ({ cookie: { accessToken, refreshToken }, jwt }) => {
      try {
        if (accessToken.value) {
          return await getUserFromAccessToken(accessToken, jwt);
        } else {
          return await refreshTokens({ jwt, accessToken, refreshToken });
        }
      } catch (err) {
        throw new UnauthorizedError();
      }
    }
  );
