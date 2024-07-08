import Elysia, { t } from "elysia";
import { env } from "./config/env";
import jwt from "@elysiajs/jwt";
import { ip } from "elysia-ip";

export const setup = new Elysia({
  name: "setup",
})
  .use(
    jwt({
      name: "jwt",
      secret: env.JWT_SECRET,
    })
  )
  .use(ip());
