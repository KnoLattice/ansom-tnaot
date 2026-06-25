"use client";

import { motion } from "framer-motion";
import { History } from "lucide-react";
import { MovementMap } from "@/components/surfaces/session/MovementMap";
import type { NodeStudied, SessionHistoryEntry } from "@/lib/types/api";

interface LastSessionSummaryProps {
  lastSession: SessionHistoryEntry;
  nodesStudied: NodeStudied[];
  nodeTitles: Record<string, string>;
}

export function LastSessionSummary({
  lastSession,
  nodesStudied,
  nodeTitles,
}: LastSessionSummaryProps) {
  if (nodesStudied.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
      className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6 shadow-soft-sm"
    >
      <div className="flex items-center gap-2">
        <History className="h-4 w-4 text-[var(--color-text-muted)]" />
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          Last Session
        </p>
      </div>

      <div className="mt-3 flex items-baseline gap-4">
        <span className="font-mono text-sm font-medium tabular-nums text-[var(--color-text-secondary)]">
          {lastSession.totalInteractions} question{lastSession.totalInteractions !== 1 ? "s" : ""}
        </span>
        {lastSession.accuracyPercent != null && (
          <span className="font-mono text-sm font-medium tabular-nums text-[var(--color-text-secondary)]">
            {lastSession.accuracyPercent}% accuracy
          </span>
        )}
      </div>

      <div className="mt-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-4">
        <MovementMap nodes={nodesStudied} nodeTitles={nodeTitles} />
      </div>
    </motion.div>
  );
}
