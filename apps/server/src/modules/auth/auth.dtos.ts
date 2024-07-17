import { t } from "elysia";
import { z } from "zod";

export const authorizeUserValidator = t.Object({
  email: t.String({
    format: "email",
    minLength: 1,
  }),
  password: t.String({
    minLength: 8,
  }),
});

export const verifyUserValidator = t.Object({
  email: t.String({
    format: "email",
    minLength: 1,
  }),
  token: t.String({
    minLength: 1,
  }),
});

export const registerUserValidator = t.Composite([
  authorizeUserValidator,
  t.Object({
    name: t.String({ minLength: 1 }),
  }),
]);

export const refreshTokenDTO = z.object({
  sessionId: z.number(),
});

export const accessTokenDTO = refreshTokenDTO.extend({
  userId: z.number(),
});
