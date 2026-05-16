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

export function RecentDocuments({ documents, activeDocumentId }: RecentDocumentsProps) {
  const router = useRouter();
  const recent = documents.slice(0, 5);

  if (recent.length === 0) return null;

  return (
    <div className="border border-[var(--color-border-default)] bg-[var(--color-surface)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] px-4 py-2">
        <p className="kl-data-label">Recent Documents</p>
        <button
          type="button"
          onClick={() => router.push("/library")}
          className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-accent-primary)] transition-colors hover:text-[var(--color-text-primary)]"
        >
          VIEW ALL
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
              transition={{ delay: index * 0.03, duration: 0.15 }}
              onClick={() => {
                if (doc.processingStatus === "completed") {
                  router.push(`/mastery/${doc.id}`);
                }
              }}
              className={cn(
                "flex w-full items-center gap-3 border-b border-[var(--color-border-subtle)] px-4 py-2.5 text-left transition-colors last:border-b-0",
                doc.processingStatus === "completed"
                  ? "cursor-pointer hover:bg-[var(--color-border-subtle)]/30"
                  : "cursor-default",
                isActive && "border-l-2 border-l-[var(--color-accent-primary)]",
              )}
            >
              <FileText className="h-3.5 w-3.5 shrink-0 text-[var(--color-text-muted)]" />

              <div className="min-w-0 flex-1">
                <p className={cn(
                  "truncate text-sm",
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
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
