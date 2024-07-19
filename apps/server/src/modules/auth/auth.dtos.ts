import { t } from "elysia";
import { z } from "zod";

const passwordDTO = t.String({
  minLength: 8,
});

const emailDTO = t.String({
  format: "email",
  minLength: 1,
});

export const forgotPasswordDTO = t.Object({
  email: emailDTO,
});

export const authorizeUserDTO = t.Object({
  email: emailDTO,
  password: passwordDTO,
});

export const verifyUserDTO = t.Object({
  email: emailDTO,
  token: t.String({
    minLength: 1,
  }),
});

export const registerUserDTO = t.Composite([
  authorizeUserDTO,
  t.Object({
    name: t.String({ minLength: 1 }),
  }),
]);

export const changePasswordDTO = t.Object({
  oldPassword: passwordDTO,
  newPassword: passwordDTO,
});

export const refreshTokenDTO = z.object({
  sessionId: z.number(),
});

export const accessTokenDTO = refreshTokenDTO.extend({
  userId: z.number(),
});
