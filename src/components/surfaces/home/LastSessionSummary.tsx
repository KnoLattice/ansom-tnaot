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
      transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
      className="space-y-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5 shadow-sm"
    >
      <p className="kl-data-label flex items-center gap-2">
        <History className="h-3.5 w-3.5" />
        Last Session Recap
      </p>
      <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)]] p-4">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-xs font-semibold tabular-nums text-[var(--color-text-muted)]">
            {lastSession.totalInteractions} interaction{lastSession.totalInteractions !== 1 ? "s" : ""}
          </span>
          {lastSession.accuracyPercent != null && (
            <span className="text-xs font-semibold tabular-nums text-[var(--color-text-secondary)]">
              {lastSession.accuracyPercent}% accuracy
            </span>
          )}
        </div>
        <MovementMap nodes={nodesStudied} nodeTitles={nodeTitles} />
      </div>
    </motion.div>
  );
}
