import { z } from "zod";

export const searchParamsSchema = z.object({
  token: z.string().min(1),
  email: z.string().email().min(1),
});
