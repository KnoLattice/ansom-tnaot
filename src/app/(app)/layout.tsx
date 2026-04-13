"use client";

import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { Navbar } from "@/components/layout/Navbar";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: PropsWithChildren) {
  const token = useAuthStore((state) => state.token);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!token) router.replace("/auth");
  }, [router, token]);

  useEffect(() => {
    const handleOffline = () => toast.error("You're offline — changes may not be saved.");
    const handleOnline = () => toast.success("Back online.");
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!token) return null;

  const isSpaceRoute = pathname === "/space";

  return (
    <div className="relative min-h-screen bg-canvas text-text-primary">
      <Navbar />
      <main
        className={cn(
          "mx-auto w-full max-w-6xl px-6 pb-12 pt-28",
          isSpaceRoute && "max-w-none px-0 pb-0",
        )}
      >
        {children}
      </main>
    </div>
  );
}
