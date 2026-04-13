"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { useAuthStore } from "@/store/auth.store";

export default function HomePage() {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();

  useEffect(() => {
    router.replace(token ? "/space" : "/auth");
  }, [router, token]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner />
    </div>
  );
}
