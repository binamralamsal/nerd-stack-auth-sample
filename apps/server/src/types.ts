import type { JWTPayloadSpec } from "@elysiajs/jwt";

export interface JWT {
  readonly sign: (
    morePayload: Record<string, string | number> & JWTPayloadSpec
  ) => Promise<string>;
  readonly verify: (
    jwt?: string
  ) => Promise<false | (Record<string, string | number> & JWTPayloadSpec)>;
}

export interface CreateEmailResponseSuccess {
  /** The ID of the newly created email. */
  id: string;
}
export interface CreateEmailResponse {
  data: CreateEmailResponseSuccess | null;
  error: ErrorResponse | null;
}

export interface ErrorResponse {
  message: string;
  name: ResendErrorCodeKey;
}

declare const RESEND_ERROR_CODES_BY_KEY: {
  readonly missing_required_field: 422;
  readonly invalid_access: 422;
  readonly invalid_parameter: 422;
  readonly invalid_region: 422;
  readonly rate_limit_exceeded: 429;
  readonly missing_api_key: 401;
  readonly invalid_api_Key: 403;
  readonly invalid_from_address: 403;
  readonly validation_error: 403;
  readonly not_found: 404;
  readonly method_not_allowed: 405;
  readonly application_error: 500;
  readonly internal_server_error: 500;
};
export type ResendErrorCodeKey = keyof typeof RESEND_ERROR_CODES_BY_KEY;
