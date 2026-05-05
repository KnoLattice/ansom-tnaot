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
    <div className="flex flex-col gap-4 border-l-2 border-l-[var(--color-accent-primary)] border border-[var(--color-border-default)] bg-[var(--color-surface)] p-4 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <p className="kl-data-label">Active Document</p>
        <h2 className="mt-1 truncate font-mono text-sm font-bold text-[var(--color-text-primary)]">
          {document.originalName}
        </h2>
        <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
          Uploaded {fromNow(document.uploadedAt)}
          {document.processedAt && ` / Processed ${fromNow(document.processedAt)}`}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!isReady}
          onClick={() => router.push(`/mastery/${document.id}`)}
        >
          <Map className="mr-2 h-3.5 w-3.5" />
          MAP
        </Button>
        <Button
          size="sm"
          disabled={!isReady}
          onClick={() =>
            router.push(`/session?documentId=${document.id}`)
          }
        >
          <PlayCircle className="mr-2 h-3.5 w-3.5" />
          SESSION
        </Button>
      </div>
    </div>
  );
}
