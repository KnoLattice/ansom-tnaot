"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, History } from "lucide-react";
import type { SessionHistoryEntry } from "@/lib/types/api";

interface LastSessionSummaryProps {
  lastSession: SessionHistoryEntry;
}

export function LastSessionSummary({ lastSession }: LastSessionSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay: 0.2 }}
      className="kl-card kl-elevation-1 flex items-center justify-between"
    >
      <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
        <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-badge)] bg-[var(--color-surface-elevated)]">
          <History className="h-4 w-4 text-[var(--color-text-muted)]" />
        </div>
        <p className="text-sm">
          <span className="text-[var(--color-text-muted)]">Last session:</span>{" "}
          <span className="font-semibold text-[var(--color-text-primary)]">
            {lastSession.totalInteractions} questions
          </span>
          {lastSession.accuracyPercent != null && (
            <>
              <span className="text-[var(--color-text-muted)]">,</span>{" "}
              <span className="font-semibold text-[var(--color-text-primary)]">
                {lastSession.accuracyPercent}% accuracy
              </span>
            </>
          )}
        </p>
      </div>
      <Link
        href={`/session/${lastSession.sessionId}/summary`}
        className="flex shrink-0 items-center gap-1 text-sm font-medium text-[var(--color-accent-primary)] transition-colors hover:text-[var(--color-text-primary)]"
      >
        View Summary <ArrowRight className="h-4 w-4" />
      </Link>
    </motion.div>
  );
}
