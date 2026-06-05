"use client";

import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MotionConfig } from "framer-motion";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { useHydrated } from "@/lib/hooks";
import { AppShell } from "@/components/layout/AppShell";

export default function AppLayout({ children }: PropsWithChildren) {
  const token = useAuthStore((state) => state.token);
  const hydrated = useHydrated();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !token) router.replace("/landing");
  }, [hydrated, router, token]);

  useEffect(() => {
    const handleOffline = () =>
      toast.error("You're offline — changes may not be saved.");
    const handleOnline = () => toast.success("Back online.");
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  // Before hydration, render children to match SSR (avoids mismatch)
  if (!hydrated) {
    return (
      <MotionConfig reducedMotion="user">
        <AppShell>{children}</AppShell>
      </MotionConfig>
    );
  }

  if (!token) return null;

  return (
    <MotionConfig reducedMotion="user">
      <AppShell>{children}</AppShell>
    </MotionConfig>
  );
}
