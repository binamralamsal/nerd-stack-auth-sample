import { edenTreaty } from "@elysiajs/eden";
import type { App } from "server";

export const api: ReturnType<typeof edenTreaty<App>> = edenTreaty<App>(
  "http://localhost:3001/"
);
