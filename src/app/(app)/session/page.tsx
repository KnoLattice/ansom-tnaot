"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";

/**
 * Legacy `/session` route — redirects to the new session flow.
 * If a documentId is provided, starts a new session via `/session/new`.
 */
export default function SessionRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const documentId = searchParams.get("documentId");

  useEffect(() => {
    if (documentId) {
      router.replace(`/session/new?documentId=${documentId}`);
    } else {
      router.replace("/");
    }
  }, [documentId, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner />
    </div>
  );
}
