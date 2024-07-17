import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    PORT: z.coerce.number(),
    DATABASE_URL: z.string().min(1),
    NODE_ENV: z.enum(["production", "development"]),
    JWT_SECRET: z.string().min(1),
    COOKIE_SIGNATURE: z.string().min(1),
    LOG_LEVEL: z
      .enum(["debug", "error", "fatal", "info", "silent", "trace", "warn"])
      .default("info"),
    FRONTEND_DOMAIN: z.string().default("localhost"),
    RESEND_API_KEY: z.string().min(1),
    FRONTEND_DOMAIN_WITH_PROTOCOL: z.string().url().min(1),
  },
  runtimeEnv: process.env,
});
