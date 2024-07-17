"use client";

import { api } from "@repo/api/client";
import { toast } from "@repo/ui/sonner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { z } from "zod";

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { token: string; email: string };
}) {
  const router = useRouter();

  useEffect(() => {
    async function verifyEmail() {
      const parsedParams = searchParamsSchema.safeParse(searchParams);
      if (parsedParams.error)
        throw new Error("Invalid email verification link!");

      const { data, error } = await api.auth.verify.post(parsedParams.data);

      if (error) throw new Error(error.message);
      return data;
    }

    verifyEmail()
      .then((message) => {
        toast.success(message);
      })
      .catch((error) => {
        toast.error(error.message);
      })
      .finally(() => {
        router.replace("/");
      });
  }, [router, searchParams]);

  return <div>We are trying to verify your email</div>;
}

const searchParamsSchema = z.object({
  token: z.string().min(1),
  email: z.string().email().min(1),
});
