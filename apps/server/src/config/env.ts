import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    PORT: z.string().transform((v) => +v),
    DATABASE_URL: z.string(),
    NODE_ENV: z.enum(["production", "development"]),
    JWT_SECRET: z.string(),
    COOKIE_SIGNATURE: z.string(),
    LOG_LEVEL: z
      .enum(["debug", "error", "fatal", "info", "silent", "trace", "warn"])
      .default("info"),
  },
  runtimeEnv: process.env,
});
