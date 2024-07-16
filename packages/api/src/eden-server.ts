import { edenTreaty } from "@elysiajs/eden";
import { cookies } from "next/headers";
import type { App } from "server";

if (!process.env.SERVER_API) {
  throw new Error("SERVER_API must be set");
}

export const api: ReturnType<typeof edenTreaty<App>> = edenTreaty<App>(
  process.env.SERVER_API,
  { $fetch: { credentials: "include" } }
);
