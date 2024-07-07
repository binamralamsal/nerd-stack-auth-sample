import { swagger } from "@elysiajs/swagger";
import { Elysia, t } from "elysia";
import { env } from "./config/env";
import cors from "@elysiajs/cors";
import { setup } from "./setup";
import { authControllers } from "./modules/auth/auth.controllers";
import { STATUS } from "./types";
import { rateLimit } from "elysia-rate-limit";
import { ElysiaLogging } from "@otherguy/elysia-logging";
import { logger } from "./libs/pino";
import { successResponseDTO } from "./dtos";

const app = new Elysia({
  cookie: {
    httpOnly: true,
    secure: true,
    secrets: env.COOKIE_SIGNATURE,
    sign: ["accessToken", "refreshToken"],
  },
})
  .use(setup)
  .use(cors())
  .use(rateLimit())
  .use(ElysiaLogging(logger))
  .use(
    swagger({
      documentation: {
        info: { title: "API Documentation", version: "0.0.0" },
        tags: [{ name: "Auth", description: "Authentication endpoints" }],
      },
    })
  )
  .onError(({ code, set, cookie: { accessToken, refreshToken } }) => {
    if (code === "NOT_FOUND")
      return { error: "Route not found :(", status: STATUS.ERROR };

    if (code === "INVALID_COOKIE_SIGNATURE")
      return { error: "Your cookies has been altered", status: STATUS.ERROR };

    set.status = 500;
    return { error: "Internal Server Error", status: STATUS.ERROR };
  })
  .get("/", () => ({ message: "Hello Elysia", status: STATUS.SUCCESS }), {
    response: { 200: successResponseDTO },
  })
  .use(authControllers)
  .listen(env.PORT);

export type App = typeof app;

logger.info(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
