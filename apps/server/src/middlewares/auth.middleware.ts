import Elysia from "elysia";
import { setup } from "../setup";
import { accessTokenDTO, refreshTokenDTO } from "../modules/auth/auth.dtos";
import { UnauthorizedError } from "../errors/unauthorized-error";
import {
  findSessionById,
  findUserById,
  logUserIn,
} from "../modules/auth/auth.services";

export const auth = new Elysia({ name: "auth" })
  .use(setup)
  .derive(
    { as: "global" },
    async ({ cookie: { accessToken, refreshToken }, jwt }) => {
      try {
        if (accessToken.value) {
          const decodedAccessToken = await jwt.verify(accessToken.value);

          if (!decodedAccessToken) throw new UnauthorizedError();
          const validatedAccessToken = accessTokenDTO.parse(decodedAccessToken);

          const user = await findUserById(validatedAccessToken.userId);
          if (!user) throw new UnauthorizedError();

          return { user };
        } else {
          const decodedRefreshToken = await jwt.verify(refreshToken.value);
          if (!decodedRefreshToken) throw new UnauthorizedError();

          const validatedRefreshToken =
            refreshTokenDTO.parse(decodedRefreshToken);

          const currentSession = await findSessionById(
            validatedRefreshToken.sessionId
          );

          if (!currentSession || !currentSession?.valid)
            throw new UnauthorizedError();

          const user = await findUserById(currentSession.userId);
          if (!user) throw new UnauthorizedError();

          await logUserIn({
            jwt,
            accessToken,
            refreshToken,
            sessionId: currentSession.id,
            userId: user.id,
          });

          return { user };
        }
      } catch (err) {
        throw new UnauthorizedError();
      }
    }
  );
