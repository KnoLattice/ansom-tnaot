"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import type { Document } from "@/lib/types/api";
import { cn } from "@/lib/utils";

interface RecentDocumentsProps {
  documents: Document[];
  activeDocumentId?: string | null;
}

function formatUploadDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function statusLabel(status: string): { text: string; color: string } {
  switch (status) {
    case "completed":
      return { text: "Ready", color: "bg-[var(--color-status-success)]/10 text-[var(--color-status-success)]" };
    case "processing":
    case "pending":
      return { text: "Processing", color: "bg-[var(--color-status-warning)]/10 text-[var(--color-status-warning)]" };
    case "failed":
      return { text: "Failed", color: "bg-[var(--color-status-danger)]/10 text-[var(--color-status-danger)]" };
    default:
      return { text: status, color: "bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]" };
  }
}

export function RecentDocuments({ documents, activeDocumentId }: RecentDocumentsProps) {
  const router = useRouter();
  const recent = documents.slice(0, 5);

  if (recent.length === 0) return null;

  return (
    <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] px-4 py-3">
        <p className="kl-data-label">Recent Documents</p>
        <button
          type="button"
          onClick={() => router.push("/library")}
          className="rounded-lg px-2.5 py-1 text-xs font-semibold text-[var(--color-accent-primary)] transition-all duration-200 hover:bg-[var(--color-accent-primary)]/10"
        >
          View all
        </button>
      </div>

      <div>
        {recent.map((doc, index) => {
          const isActive = doc.id === activeDocumentId;
          const status = statusLabel(doc.processingStatus);
          const sizeMB = (Number(doc.fileSizeBytes) / (1024 * 1024)).toFixed(1);

          return (
            <motion.button
              key={doc.id}
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.04, duration: 0.3 }}
              onClick={() => {
                if (doc.processingStatus === "completed") {
                  router.push(`/mastery/${doc.id}`);
                }
              }}
              className={cn(
                "flex w-full items-center gap-3 border-b border-[var(--color-border-subtle)] px-4 py-3 text-left transition-all duration-200 last:border-b-0",
                doc.processingStatus === "completed"
                  ? "cursor-pointer hover:bg-[var(--color-surface-elevated)]"
                  : "cursor-default",
                isActive && "bg-[var(--color-accent-primary)]/[0.03]",
              )}
            >
              <div className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                isActive
                  ? "bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]"
                  : "bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]",
              )}>
                <FileText className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className={cn(
                  "truncate text-sm",
                  isActive
                    ? "font-semibold text-[var(--color-text-primary)]"
                    : "font-medium text-[var(--color-text-secondary)]",
                )}>
                  {doc.originalName}
                </p>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  {sizeMB}MB · {formatUploadDate(doc.uploadedAt)}
                </p>
              </div>

              <span className={cn(
                "shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
                status.color,
              )}>
                {status.text}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
