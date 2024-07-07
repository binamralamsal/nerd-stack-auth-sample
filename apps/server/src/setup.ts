import Elysia, { t } from "elysia";
import { env } from "./config/env";
import jwt from "@elysiajs/jwt";
import { ip } from "elysia-ip";
import { STATUS } from "./types";

export const setup = new Elysia({
  name: "setup",
  cookie: {
    secrets: env.COOKIE_SIGNATURE,
    sign: ["accessToken", "refreshToken"],
  },
})
  .use(
    jwt({
      name: "jwt",
      secret: env.JWT_SECRET,
    })
  )
  .use(ip())
  .model({
    tokenCookie: t.Cookie({
      accessToken: t.Optional(t.String()),
      refreshToken: t.Optional(t.String()),
    }),
    response: t.Object({
      message: t.String(),
      status: t.Enum(STATUS),
    }),
  });
