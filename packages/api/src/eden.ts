import { edenTreaty } from "@elysiajs/eden";
import type { App } from "server";

const { SERVER_API, NEXT_PUBLIC_CLIENT_API } = process.env;

if (!SERVER_API || !NEXT_PUBLIC_CLIENT_API) {
  throw new Error("SERVER_API and NEXT_PUBLIC_CLIENT_API must be set");
}

export const serverApi: ReturnType<typeof edenTreaty<App>> = edenTreaty<App>(
  SERVER_API,
  { $fetch: { credentials: "include" } }
);

export const clientApi: ReturnType<typeof edenTreaty<App>> = edenTreaty<App>(
  NEXT_PUBLIC_CLIENT_API,
  { $fetch: { credentials: "include" } }
);
