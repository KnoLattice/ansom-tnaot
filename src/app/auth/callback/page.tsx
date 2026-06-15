"use client";

import { Suspense } from "react";
import { useAuth } from "@/lib/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/Spinner";

function CallbackHandler() {
  const { completeGoogleLogin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      router.replace("/");
      return;
    }

    completeGoogleLogin({ accessToken: token }).finally(() => {
      router.replace("/");
    });
  }, [completeGoogleLogin, router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Spinner />
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
