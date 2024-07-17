import { redirect } from "next/navigation";

import { searchParamsSchema } from "./search-params-dto";
import { VerifyEmail } from "./verify-email";

export const dynamic = "force-dynamic";

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { token: string; email: string };
}) {
  const parsedSearchParams = searchParamsSchema.safeParse(searchParams);

  if (parsedSearchParams.error) return redirect("/");

  return <VerifyEmail searchParams={parsedSearchParams.data} />;
}
