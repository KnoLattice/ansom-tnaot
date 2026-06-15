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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="space-y-2 border border-[var(--color-border-default)] bg-[var(--color-surface)] p-4"
    >
      <p className="kl-data-label flex items-center gap-1.5 font-bold">
        <History className="h-3.5 w-3.5" />
        Last Session Recap
      </p>
      <div className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-surface)] p-4">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="font-mono text-xs font-bold tabular-nums text-[var(--color-text-muted)]">
            {lastSession.totalInteractions} INTERACTION{lastSession.totalInteractions !== 1 ? "S" : ""}
          </span>
          {lastSession.accuracyPercent != null && (
            <span className="font-mono text-xs font-bold tabular-nums text-[var(--color-text-secondary)]">
              {lastSession.accuracyPercent}% ACC
            </span>
          )}
        </div>
        <MovementMap nodes={nodesStudied} nodeTitles={nodeTitles} />
      </div>
    </motion.div>
  );
}
