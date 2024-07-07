import { t } from "elysia";
import { STATUS } from "./types";

export const successResponseDTO = t.Object({
  message: t.String(),
  status: t.Enum(STATUS),
});

export const errorResponseDTO = t.Object({
  error: t.String(),
  status: t.Enum(STATUS),
});
