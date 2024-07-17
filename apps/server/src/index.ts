import cors from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { ElysiaLogging } from "@otherguy/elysia-logging";
import { Elysia } from "elysia";

import { env } from "#config/env";
import { logger } from "#libs/pino";
import { authControllers } from "#modules/auth/auth.controllers";
import { setup } from "#setup";

const app = new Elysia({
  cookie: {
    secrets: env.COOKIE_SIGNATURE,
    sign: ["accessToken", "refreshToken"],
    httpOnly: true,
    secure: true,
    domain: env.FRONTEND_DOMAIN,
    sameSite: "lax",
  },
})
  .use(
    cors({
      origin: ["https://binamralamsal.com", "localhost"],
      credentials: true,
      allowedHeaders: ["Content-Type"],
    })
  )
  .use(setup)
  .use(ElysiaLogging(logger))
  .use(
    swagger({
      documentation: {
        info: { title: "API Documentation", version: "0.0.0" },
        tags: [{ name: "Auth", description: "Authentication endpoints" }],
      },
    })
  )
  .onError(({ code, error, set }) => {
    if (code === "NOT_FOUND") return "Route not found :(";

    // Commented because of bug in Elysiajs: https://github.com/elysiajs/elysia/issues/707
    // if (code === "INVALID_COOKIE_SIGNATURE")
    //   return { error: "Your cookies has been altered", status: STATUS.ERROR };

    if (code === "HTTP_ERROR" || code === "UNAUTHORIZED_ERROR") {
      set.status = error.statusCode;
      return error.message;
    }

    if (code === "VALIDATION") return error.message;

    logger.error(error);
    return "Internal Server Error";
  })

  .get("/", () => "Hello API Server")
  .use(authControllers)
  .listen(env.PORT);

export type App = typeof app;

logger.info(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
