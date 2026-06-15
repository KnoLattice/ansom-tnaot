"use client";

import dayjs from "dayjs";
import { AlertCircle, CheckCircle2, MoreVertical } from "lucide-react";
import type { Document } from "@/lib/types/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProcessingStatus } from "@/components/library/ProcessingStatus";

interface DocumentCardProps {
  document: Document;
  active?: boolean;
  onSelect: (id: string) => void;
  onOpenUniverse: (id: string) => void;
  onViewProgress: (id: string) => void;
  onDelete: (id: string) => void;
}

export function DocumentCard({
  document,
  active,
  onSelect,
  onOpenUniverse,
  onViewProgress,
  onDelete,
}: DocumentCardProps) {
  const isReady = document.processingStatus === "completed";
  const isProcessing = document.processingStatus === "processing" || document.processingStatus === "pending";
  const isFailed = document.processingStatus === "failed";

  const fileSizeMB = Number(document.fileSizeBytes ?? 0) / (1024 * 1024);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(document.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter") onSelect(document.id);
      }}
      className={cn(
        "flex h-full flex-col justify-between rounded-3xl border rounded-lg border-white/5 bg-white/5 p-6 text-white shadow-[0_20px_60px_rgba(3,4,13,0.4)] transition",
        active && "border-[var(--color-accent-primary)] shadow-glow",
      )}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">Document</p>
            <h3 className="mt-2 text-lg font-semibold leading-tight text-white">
              {document.originalName}
            </h3>
            <p className="mt-1 text-sm text-white/60">
              Uploaded {dayjs(document.uploadedAt).format("MMM D, YYYY")} · {(fileSizeMB || 0).toFixed(2)} MB
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 hover:text-white"
                onClick={(event) => event.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40 border-white/10 bg-surface text-white">
              <DropdownMenuItem
                className="text-rose-300"
                onClick={(event) => {
                  event.stopPropagation();
                  if (window.confirm("Delete this document and its knowledge graph?")) {
                    onDelete(document.id);
                  }
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isReady && (
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-100">
            <div className="flex items-center gap-2 font-medium text-emerald-200">
              <CheckCircle2 className="h-4 w-4" /> Graph ready
            </div>
            <p className="mt-1 text-white/70">
              Concepts extracted and connected. Start a session or explore the universe.
            </p>
          </div>
        )}

        {isProcessing && <ProcessingStatus status={document.processingStatus} />}
        {isFailed && (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-100">
            <div className="flex items-center gap-2 font-medium">
              <AlertCircle className="h-4 w-4" /> Processing failed
            </div>
            <p className="mt-1 text-white/70">
              Try re-uploading with a clearer PDF or contact support with this file.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Badge variant={active ? "default" : "outline"} className="border-white/20 text-white/70">
          {active ? "Active" : "Stored"}
        </Badge>
        <Badge variant="outline" className="border-white/10 text-white/60">
          Status: {document.processingStatus}
        </Badge>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button
          className="flex-1 bg-[var(--color-accent-primary)] text-white"
          disabled={!isReady}
          onClick={(event) => {
            event.stopPropagation();
            onOpenUniverse(document.id);
          }}
        >
          Open universe
        </Button>
        <Button
          variant="secondary"
          className="flex-1 border border-white/10 bg-white/10 text-white"
          disabled={!isReady}
          onClick={(event) => {
            event.stopPropagation();
            onViewProgress(document.id);
          }}
        >
          View progress
        </Button>
      </div>
    </div>
  );
}
