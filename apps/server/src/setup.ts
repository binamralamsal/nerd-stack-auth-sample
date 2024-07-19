import { Elysia } from "elysia";
import { ip } from "elysia-ip";

import { HTTPError } from "#errors/http-error";
import { UnauthorizedError } from "#errors/unauthorized-error";

export const setup = new Elysia({
  name: "setup",
})
  .error({
    HTTP_ERROR: HTTPError,
    UNAUTHORIZED_ERROR: UnauthorizedError,
  })

  .use(ip());
