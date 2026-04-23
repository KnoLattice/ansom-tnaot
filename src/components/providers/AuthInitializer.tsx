"use client";

import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import { useAuth, useHydrated } from "@/lib/hooks";
import { Spinner } from "@/components/ui/Spinner";
import { useAuthStore } from "@/store/auth.store";

export function AuthInitializer({ children }: PropsWithChildren) {
  const token = useAuthStore((state) => state.token);
  const { fetchCurrentLearner } = useAuth();
  const hydrated = useHydrated();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    let active = true;
    const init = async () => {
      if (token) {
        await fetchCurrentLearner();
      }
      if (active) setReady(true);
    };
    init();
    return () => {
      active = false;
    };
  }, [hydrated, fetchCurrentLearner, token]);

  // Before hydration, always render children to match SSR
  if (!hydrated) return <>{children}</>;

  // After hydration, show spinner while fetching learner data
  if (!ready && token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
