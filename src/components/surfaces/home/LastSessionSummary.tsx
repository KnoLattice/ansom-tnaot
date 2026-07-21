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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="flex items-center justify-between border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-4 py-2.5"
    >
      <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
        <History className="h-3.5 w-3.5 shrink-0 text-[var(--color-text-muted)]" />
        <p className="font-mono text-xs">
          <span className="text-[var(--color-text-muted)]">LAST SESSION:</span>{" "}
          <span className="font-bold text-[var(--color-text-primary)]">
            {lastSession.totalInteractions} questions
          </span>
          {lastSession.accuracyPercent != null && (
            <>
              <span className="text-[var(--color-text-muted)]">,</span>{" "}
              <span className="font-bold text-[var(--color-text-primary)]">
                {lastSession.accuracyPercent}% accuracy
              </span>
            </>
          )}
        </p>
      </div>
      <Link
        href={`/session/${lastSession.sessionId}/summary`}
        className="flex shrink-0 items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent-primary)] transition-colors hover:text-[var(--color-text-primary)]"
      >
        VIEW SUMMARY <ArrowRight className="h-3 w-3" />
      </Link>
    </motion.div>
  );
}
