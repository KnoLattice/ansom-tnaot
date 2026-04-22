"use client";

import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MotionConfig } from "framer-motion";
import { useAuthStore } from "@/store/auth.store";

export default function AuthLayout({ children }: PropsWithChildren) {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();

  useEffect(() => {
    if (token) router.replace("/");
  }, [router, token]);

  if (token) return null;

  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  );
}
