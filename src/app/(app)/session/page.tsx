"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";

function SessionRedirect() {
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

/**
 * Legacy `/session` route — redirects to the new session flow.
 */
export default function SessionRedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <SessionRedirect />
    </Suspense>
  );
}
