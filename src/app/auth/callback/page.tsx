"use client";

import { Suspense } from "react";
import { useAuth } from "@/lib/hooks";
import { useAuthStore } from "@/store/auth.store";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/Spinner";

function CallbackHandler() {
  const { completeGoogleLogin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const learner = useAuthStore((s) => s.learner);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      router.replace("/");
      return;
    }

    completeGoogleLogin({ accessToken: token }).finally(() => {});
  }, [completeGoogleLogin, router, searchParams]);

  useEffect(() => {
    if (!learner) return;

    if (!learner.learningPreferences) {
      router.replace("/auth?view=onboarding");
    } else {
      router.replace("/");
    }
  }, [learner, router]);

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
