"use client";

import type { PropsWithChildren } from "react";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MotionConfig } from "framer-motion";
import { useAuthStore } from "@/store/auth.store";
import { useHydrated } from "@/lib/hooks";

function AuthLayoutInner({ children }: PropsWithChildren) {
  const token = useAuthStore((state) => state.token);
  const hydrated = useHydrated();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get("view") === "onboarding";

  useEffect(() => {
    if (hydrated && token && !isOnboarding) router.replace("/");
  }, [hydrated, router, token, isOnboarding]);

  // Before hydration, render children to match SSR
  if (!hydrated) {
    return (
      <MotionConfig reducedMotion="user">
        {children}
      </MotionConfig>
    );
  }

  if (token && !isOnboarding) return null;

  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  );
}

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-canvas">
          <div className="text-xs uppercase tracking-[0.4em] text-text-muted">Loading...</div>
        </div>
      }
    >
      <AuthLayoutInner>{children}</AuthLayoutInner>
    </Suspense>
  );
}
