"use client";

import { useAuth } from "@/lib/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function AuthCallbackPage() {
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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Completing your sign in…
        </h1>
        <p className="mt-4 text-sm text-zinc-500">
          Hold tight while we finalize your session and redirect you back to the
          dashboard.
        </p>
      </div>
    </div>
  );
}
