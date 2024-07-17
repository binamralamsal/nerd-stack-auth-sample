"use client";

import { api } from "@repo/api/client";
import { toast } from "@repo/ui/sonner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { z } from "zod";

import type { searchParamsSchema } from "./search-params-dto";

export function VerifyEmail({
  searchParams,
}: {
  searchParams: z.infer<typeof searchParamsSchema>;
}) {
  const router = useRouter();

  useEffect(() => {
    async function verifyEmail() {
      const { data, error } = await api.auth.verify.post(searchParams);

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

  return <div>We are verifying your email</div>;
}
