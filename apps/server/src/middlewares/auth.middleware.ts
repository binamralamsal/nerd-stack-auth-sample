import Elysia from "elysia";
import { setup } from "../setup";
import { accessTokenDTO, refreshTokenDTO } from "../modules/auth/auth.dtos";
import { db } from "../drizzle/db";
import { eq } from "drizzle-orm";
import { sessionsTable, usersTable } from "../drizzle/schema";
import { STATUS } from "../types";

export const auth = new Elysia({ name: "auth" })
  .use(setup)
  .derive(
    { as: "global" },
    async ({ cookie: { accessToken, refreshToken }, error, jwt }) => {
      try {
        if (accessToken.value) {
          if (typeof accessToken.value !== "string") throw new Error();

          const decodedAccessToken = await jwt.verify(accessToken.value);
          const validatedAccessToken = accessTokenDTO.parse(decodedAccessToken);

          const user = await db.query.usersTable.findFirst({
            where: eq(usersTable.id, validatedAccessToken.userId),
          });

          if (!user) throw new Error();

          return { user };
        } else {
          if (typeof refreshToken.value !== "string") throw new Error();

          const decodedRefreshToken = await jwt.verify(refreshToken.value);
          const validatedRefreshToken =
            refreshTokenDTO.parse(decodedRefreshToken);

          const currentSession = await db.query.sessionsTable.findFirst({
            where: eq(sessionsTable.id, validatedRefreshToken.sessionId),
          });

          if (!currentSession || !currentSession?.valid) throw new Error();

          const user = await db.query.usersTable.findFirst({
            where: eq(usersTable.id, currentSession.userId),
          });

          if (!user) throw new Error();

          accessToken.set({
            value: await jwt.sign({
              sessionId: currentSession.id,
              userId: user.id,
            }),
          });
          refreshToken.set({
            value: await jwt.sign({ sessionId: currentSession.id }),
            maxAge: 30 * 24 * 60 * 60,
          });

          return { user };
        }
      } catch (err) {
        return error(401, {
          error: "User not logged in",
          status: STATUS.ERROR,
        });
      }
    }
  );
