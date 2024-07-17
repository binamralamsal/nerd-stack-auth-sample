import { resend } from "#libs/resend";
import type { CreateEmailResponse } from "#types";

export async function sendEmail(
  data: {
    from: string;
    to: string | string[];
    subject: string;
  } & ({ react: JSX.Element } | { html: string } | { text: string })
): Promise<CreateEmailResponse> {
  return resend.emails.send(data);
}
