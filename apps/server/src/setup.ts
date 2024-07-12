import Elysia, { t } from "elysia";
import { env } from "./config/env";
import jwt from "@elysiajs/jwt";
import { ip } from "elysia-ip";
import { HTTPError } from "./errors/http-error";
import { UnauthorizedError } from "./errors/unauthorized-error";

export const setup = new Elysia({
  name: "setup",
})
  .error({
    HTTP_ERROR: HTTPError,
    UNAUTHORIZED_ERROR: UnauthorizedError,
  })
  .use(
    jwt({
      name: "jwt",
      secret: env.JWT_SECRET,
    })
  )
  .use(ip());
