"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FileText, ArrowRight, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useUploadDocument } from "@/lib/hooks";
import type { Document } from "@/lib/types/api";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["application/pdf", "text/plain"];

interface DocumentsSectionProps {
  documents: Document[];
  activeDocumentId?: string | null;
}

function formatUploadDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d
    .toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function statusLabel(status: string): { text: string; color: string } {
  switch (status) {
    case "completed":
      return { text: "Ready", color: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10" };
    case "processing":
    case "pending":
      return { text: "Processing", color: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10" };
    case "failed":
      return { text: "Failed", color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10" };
    default:
      return {
        text: status,
        color: "text-[var(--color-text-muted)] bg-[var(--color-surface-elevated)]",
      };
  }
}

export function DocumentsSection({
  documents,
  activeDocumentId,
}: DocumentsSectionProps) {
  const router = useRouter();
  const uploadDocument = useUploadDocument();
  const [isDragActive, setIsDragActive] = useState(false);

  const recent = documents.slice(0, 5);

  const handleFiles = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;

      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error("Only PDF and plain text files are supported.");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File exceeds 10 MB limit.");
        return;
      }

      try {
        await uploadDocument(file);
        toast.success("Document uploaded successfully.");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Upload failed";
        toast.error(message);
      }
    },
    [uploadDocument],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay: 0.15 }}
      className="kl-card kl-elevation-1 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3">
        <p className="kl-data-label">Documents</p>
        <button
          type="button"
          onClick={() => router.push("/library")}
          className="flex items-center gap-1 text-xs font-medium text-[var(--color-accent-primary)] transition-colors hover:text-[var(--color-text-primary)]"
        >
          View All <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Document list */}
      {recent.length > 0 ? (
        <div className="px-5 py-3">
          {recent.map((doc) => {
            const isActive = doc.id === activeDocumentId;
            const status = statusLabel(doc.processingStatus);
            const sizeMB = (Number(doc.fileSizeBytes) / (1024 * 1024)).toFixed(
              1,
            );

            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => {
                  if (doc.processingStatus === "completed") {
                    router.push(`/mastery/${doc.id}`);
                  }
                }}
                className={cn(
                  "flex w-full items-center gap-3 border-b border-[var(--color-border-subtle)] py-3 text-left transition-colors last:border-b-0",
                  doc.processingStatus === "completed"
                    ? "cursor-pointer hover:opacity-70"
                    : "cursor-default",
                )}
              >
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-[var(--radius-badge)]",
                  isActive ? "bg-[var(--color-accent-primary)]/10" : "bg-[var(--color-surface-elevated)]",
                )}>
                  <FileText className={cn(
                    "h-4 w-4",
                    isActive ? "text-[var(--color-accent-primary)]" : "text-[var(--color-text-muted)]",
                  )} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                    {doc.originalName}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {sizeMB}MB &middot; {formatUploadDate(doc.uploadedAt)}
                  </p>
                </div>

                <span
                  className={cn(
                    "shrink-0 rounded-[var(--radius-badge)] px-2 py-0.5 text-xs font-medium",
                    status.color,
                  )}
                >
                  {status.text}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="px-5 py-6 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            No documents yet
          </p>
        </div>
      )}
      <label
        htmlFor="home-quick-upload"
        onDrop={(e) => {
          e.preventDefault();
          setIsDragActive(false);
          if (e.dataTransfer?.files) {
            handleFiles(Array.from(e.dataTransfer.files));
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragActive(true);
        }}
        onDragLeave={() => setIsDragActive(false)}
        className={cn(
          "flex rounded-lg cursor-pointer items-center justify-center gap-2 border-t border-[var(--color-border-subtle)] px-5 py-3 text-sm font-medium text-white transition-colors",
          isDragActive
            ? "bg-[var(--color-accent-primary)]"
            : "bg-[var(--color-accent-primary)] hover:brightness-110",
        )}
      >
        <input
          id="home-quick-upload"
          type="file"
          accept=".pdf,.txt"
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) {
              handleFiles(Array.from(e.target.files));
            }
            e.target.value = "";
          }}
        />
        <Upload className="h-4 w-4" />
        {isDragActive ? "Drop to upload" : "Quick Upload"}
      </label>
    </motion.div>
  );
}
