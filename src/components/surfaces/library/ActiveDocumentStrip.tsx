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
    <div className="flex flex-col gap-4 rounded-2xl border border-accent-primary/30 bg-accent-primary/5 p-5 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-widest text-text-muted">
          Active Document
        </p>
        <h2 className="mt-1 truncate text-lg font-semibold text-white">
          {document.originalName}
        </h2>
        <p className="mt-0.5 text-sm text-text-secondary">
          Uploaded {fromNow(document.uploadedAt)}
          {document.processedAt && ` · Processed ${fromNow(document.processedAt)}`}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="border border-white/10 bg-white/10 text-white"
          disabled={!isReady}
          onClick={() => router.push(`/mastery/${document.id}`)}
        >
          <Map className="mr-2 h-4 w-4" />
          Mastery Map
        </Button>
        <Button
          size="sm"
          disabled={!isReady}
          onClick={() =>
            router.push(`/session?documentId=${document.id}`)
          }
        >
          <PlayCircle className="mr-2 h-4 w-4" />
          Start session
        </Button>
      </div>
    </div>
  );
}
