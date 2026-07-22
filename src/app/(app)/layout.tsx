"use client";

import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, MotionConfig } from "framer-motion";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { useHydrated } from "@/lib/hooks";
import { AppShell } from "@/components/layout/AppShell";

export default function AppLayout({ children }: PropsWithChildren) {
  const token = useAuthStore((state) => state.token);
  const hydrated = useHydrated();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (hydrated && !token) router.replace("/auth");
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
      <AppShell>
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </AppShell>
    </MotionConfig>
  );
}
