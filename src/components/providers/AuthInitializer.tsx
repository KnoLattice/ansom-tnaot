"use client";

import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks";
import { Spinner } from "@/components/ui/Spinner";
import { useAuthStore } from "@/store/auth.store";

export function AuthInitializer({ children }: PropsWithChildren) {
  const token = useAuthStore((state) => state.token);
  const { fetchCurrentLearner } = useAuth();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    const hydrate = async () => {
      if (token) {
        await fetchCurrentLearner();
      }
      if (active) setHydrated(true);
    };

    hydrate();
    return () => {
      active = false;
    };
  }, [fetchCurrentLearner, token]);

  if (!hydrated && token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
