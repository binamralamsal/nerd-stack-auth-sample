import { edenTreaty } from "@elysiajs/eden";
import type { App } from "server";

export const api: ReturnType<typeof edenTreaty<App>> = edenTreaty<App>(
  "https://api.binamralamsal.com/",
  { $fetch: { credentials: "include" } }
);
