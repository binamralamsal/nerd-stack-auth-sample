import { edenTreaty } from "@elysiajs/eden";
import type { App } from "server";

if (!process.env.NEXT_PUBLIC_CLIENT_API) {
  throw new Error("NEXT_PUBLIC_CLIENT_API must be set");
}

export const api: ReturnType<typeof edenTreaty<App>> = edenTreaty<App>(
  process.env.NEXT_PUBLIC_CLIENT_API,
  { $fetch: { credentials: "include" } }
);
