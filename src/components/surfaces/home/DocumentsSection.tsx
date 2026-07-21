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
  if (diffMins < 1) return "JUST NOW";
  if (diffMins < 60) return `${diffMins}M AGO`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}H AGO`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}D AGO`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
}

function statusLabel(status: string): { text: string; color: string } {
  switch (status) {
    case "completed":
      return { text: "READY", color: "text-green-400 border-green-500" };
    case "processing":
    case "pending":
      return { text: "PROCESSING", color: "text-yellow-400 border-yellow-500" };
    case "failed":
      return { text: "FAILED", color: "text-red-400 border-red-500" };
    default:
      return { text: status.toUpperCase(), color: "text-[var(--color-text-muted)] border-[var(--color-border-default)]" };
  }
}

export function DocumentsSection({ documents, activeDocumentId }: DocumentsSectionProps) {
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="border border-[var(--color-border-subtle)] bg-[var(--color-surface)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] px-4 py-2">
        <p className="kl-data-label">DOCUMENTS</p>
        <button
          type="button"
          onClick={() => router.push("/library")}
          className="flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent-primary)] transition-colors hover:text-[var(--color-text-primary)]"
        >
          VIEW ALL <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* Document list */}
      {recent.length > 0 ? (
        <div>
          {recent.map((doc) => {
            const isActive = doc.id === activeDocumentId;
            const status = statusLabel(doc.processingStatus);
            const sizeMB = (Number(doc.fileSizeBytes) / (1024 * 1024)).toFixed(1);

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
                  "flex w-full items-center gap-3 border-b border-[var(--color-border-subtle)] px-4 py-2 text-left transition-colors last:border-b-0",
                  doc.processingStatus === "completed"
                    ? "cursor-pointer hover:bg-[var(--color-border-subtle)]/30"
                    : "cursor-default",
                  isActive && "border-l-2 border-l-[var(--color-accent-primary)]",
                )}
              >
                <FileText className="h-3.5 w-3.5 shrink-0 text-[var(--color-text-muted)]" />

                <div className="min-w-0 flex-1">
                  <p className={cn(
                    "truncate text-xs",
                    isActive
                      ? "font-bold text-[var(--color-text-primary)]"
                      : "font-medium text-[var(--color-text-secondary)]",
                  )}>
                    {doc.originalName}
                  </p>
                  <p className="font-mono text-[9px] text-[var(--color-text-muted)]">
                    {sizeMB}MB -- {formatUploadDate(doc.uploadedAt)}
                  </p>
                </div>

                <span className={cn(
                  "shrink-0 border px-1.5 py-0.5 font-mono text-[9px] font-bold",
                  status.color,
                )}>
                  {status.text}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="px-4 py-3 text-center">
          <p className="font-mono text-xs text-[var(--color-text-muted)]">No documents yet</p>
        </div>
      )}

      {/* Quick upload zone */}
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
          "flex cursor-pointer items-center justify-center gap-2 border-t border-[var(--color-border-subtle)] px-4 py-2.5 transition-colors",
          isDragActive
            ? "border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/5"
            : "hover:bg-[var(--color-border-subtle)]/30",
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
        <Upload className={cn(
          "h-3.5 w-3.5",
          isDragActive ? "text-[var(--color-accent-primary)]" : "text-[var(--color-text-muted)]",
        )} />
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
          {isDragActive ? "DROP TO UPLOAD" : "QUICK UPLOAD"}
        </span>
      </label>
    </motion.div>
  );
}
