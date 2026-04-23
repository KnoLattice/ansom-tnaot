"use client";

import { motion } from "framer-motion";
import { MovementMap } from "@/components/surfaces/session/MovementMap";
import type { NodeStudied, SessionHistoryEntry } from "@/lib/types/api";

interface LastSessionSummaryProps {
  lastSession: SessionHistoryEntry;
  /** If we have cached node-level data from sessionStorage */
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
      transition={{ duration: 0.3, delay: 0.25 }}
      className="space-y-2"
    >
      <p className="text-xs uppercase tracking-widest text-text-muted">
        Last session recap
      </p>
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
        <div className="mb-2 flex items-baseline justify-between text-xs text-text-muted">
          <span>
            {lastSession.totalInteractions} question
            {lastSession.totalInteractions !== 1 ? "s" : ""}
          </span>
          {lastSession.accuracyPercent != null && (
            <span>{lastSession.accuracyPercent}% accuracy</span>
          )}
        </div>
        <MovementMap nodes={nodesStudied} nodeTitles={nodeTitles} />
      </div>
    </motion.div>
  );
}
