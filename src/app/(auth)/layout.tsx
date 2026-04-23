"use client";

import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MotionConfig } from "framer-motion";
import { useAuthStore } from "@/store/auth.store";
import { useHydrated } from "@/lib/hooks";

export default function AuthLayout({ children }: PropsWithChildren) {
  const token = useAuthStore((state) => state.token);
  const hydrated = useHydrated();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && token) router.replace("/");
  }, [hydrated, router, token]);

  // Before hydration, render children to match SSR
  if (!hydrated) {
    return (
      <MotionConfig reducedMotion="user">
        {children}
      </MotionConfig>
    );
  }

  if (token) return null;

  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  );
}
