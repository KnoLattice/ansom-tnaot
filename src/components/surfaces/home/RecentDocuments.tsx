"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FileText, ChevronRight } from "lucide-react";
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

function statusBadge(status: string): { text: string; className: string } {
  switch (status) {
    case "completed":
      return { text: "Ready", className: "bg-emerald-50 text-emerald-700" };
    case "processing":
    case "pending":
      return { text: "Processing", className: "bg-amber-50 text-amber-700" };
    case "failed":
      return { text: "Failed", className: "bg-red-50 text-red-700" };
    default:
      return { text: status, className: "bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]" };
  }
}

export function RecentDocuments({ documents, activeDocumentId }: RecentDocumentsProps) {
  const router = useRouter();
  const recent = documents.slice(0, 5);

  if (recent.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between px-1 pb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          Recent Documents
        </p>
        <button
          type="button"
          onClick={() => router.push("/library")}
          className="text-xs font-semibold text-[var(--color-accent-primary)] transition-colors hover:text-[var(--color-accent-primary)]/80"
        >
          View all
        </button>
      </div>

      <div className="space-y-1">
        {recent.map((doc, index) => {
          const isActive = doc.id === activeDocumentId;
          const status = statusBadge(doc.processingStatus);

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
                "flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left transition-colors",
                doc.processingStatus === "completed"
                  ? "cursor-pointer hover:bg-[var(--color-surface-elevated)]"
                  : "cursor-default",
                isActive && "bg-[var(--color-accent-primary)]/5 border border-[var(--color-accent-primary)]/20",
                !isActive && "border border-transparent",
              )}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-elevated)]">
                <FileText className="h-4 w-4 text-[var(--color-text-muted)]" />
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
                <p className="text-xs text-[var(--color-text-muted)]">
                  {formatUploadDate(doc.uploadedAt)}
                </p>
              </div>

              <span className={cn(
                "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                status.className,
              )}>
                {status.text}
              </span>

              {doc.processingStatus === "completed" && (
                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
