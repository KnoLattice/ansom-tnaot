"use client";

import { useRouter } from "next/navigation";
import { PlayCircle, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Document } from "@/lib/types/api";
import { fromNow } from "@/lib/utils/format";

interface ActiveDocumentStripProps {
  document: Document;
}

export function ActiveDocumentStrip({ document }: ActiveDocumentStripProps) {
  const router = useRouter();
  const isReady = document.processingStatus === "completed";

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[var(--color-accent-primary)]/20 bg-[var(--color-accent-primary)]/5 p-4 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-medium text-[var(--color-accent-primary)]">Active document</p>
        <h2 className="mt-1 truncate text-sm font-semibold text-[var(--color-text-primary)]">
          {document.originalName}
        </h2>
        <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
          Uploaded {fromNow(document.uploadedAt)}
          {document.processedAt && ` · Processed ${fromNow(document.processedAt)}`}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-[var(--color-border-default)]"
          disabled={!isReady}
          onClick={() => router.push(`/mastery/${document.id}`)}
        >
          <Map className="mr-2 h-3.5 w-3.5" />
          View map
        </Button>
        <Button
          size="sm"
          className="rounded-xl bg-[var(--color-accent-primary)] text-white hover:opacity-90"
          disabled={!isReady}
          onClick={() =>
            router.push(`/session?documentId=${document.id}`)
          }
        >
          <PlayCircle className="mr-2 h-3.5 w-3.5" />
          Study
        </Button>
      </div>
    </div>
  );
}
