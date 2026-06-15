"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";

function SessionRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const documentId = searchParams.get("documentId");
  const nodeId = searchParams.get("nodeId");

  useEffect(() => {
    if (documentId) {
      const params = new URLSearchParams({ documentId });
      if (nodeId) params.set("nodeId", nodeId);
      router.replace(`/session/new?${params.toString()}`);
    } else {
      router.replace("/");
    }
  }, [documentId, nodeId, router]);

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
