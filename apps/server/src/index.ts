import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { env } from "./config/env";
import { setup } from "./setup";
import { authControllers } from "./modules/auth/auth.controllers";
import { STATUS } from "./types";
import { rateLimit } from "elysia-rate-limit";
import { ElysiaLogging } from "@otherguy/elysia-logging";
import { logger } from "./libs/pino";
import cors from "@elysiajs/cors";

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
      origin: ["https://binamralamsal.com"],
      credentials: true,
      allowedHeaders: ["Content-Type"],
    })
  )
  .use(setup)
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
  .onError(({ code, error }) => {
    if (code === "NOT_FOUND")
      return { error: "Route not found :(", status: STATUS.ERROR };

    // Commented because of bug in Elysiajs: https://github.com/elysiajs/elysia/issues/707
    // if (code === "INVALID_COOKIE_SIGNATURE")
    //   return { error: "Your cookies has been altered", status: STATUS.ERROR };

    if (code === "VALIDATION") return error.message;
    return { error: "Internal Server Error", status: STATUS.ERROR };
  })

  .get("/", () => ({ message: "Hello Elysia", status: STATUS.SUCCESS }))
  .use(authControllers)
  .listen(env.PORT);

export type App = typeof app;

logger.info(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
