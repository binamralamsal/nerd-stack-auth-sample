import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    SERVER_API: z.string().url(),
    FRONTEND_DOMAIN: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_CLIENT_API: z.string().url().min(1),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_CLIENT_API: process.env.NEXT_PUBLIC_CLIENT_API,
  },
});
