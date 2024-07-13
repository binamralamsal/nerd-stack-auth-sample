import type { JWTPayloadSpec } from "@elysiajs/jwt";

export enum STATUS {
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

export interface JWT {
  readonly sign: (
    morePayload: Record<string, string | number> & JWTPayloadSpec
  ) => Promise<string>;
  readonly verify: (
    jwt?: string
  ) => Promise<false | (Record<string, string | number> & JWTPayloadSpec)>;
}
