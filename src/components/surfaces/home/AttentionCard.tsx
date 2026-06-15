"use client";

import { motion } from "framer-motion";
import { ConceptTile } from "@/components/shared/ConceptTile";
import type { WeakNode } from "@/lib/types/api";

interface AttentionCardProps {
  weakNodes: WeakNode[];
  onStudy: (nodeIds: string[]) => void;
}

function urgencyLabel(urgency: WeakNode["urgency"]): string {
  switch (urgency) {
    case "critical":
      return "CRITICAL";
    case "high":
      return "HIGH";
    case "medium":
      return "MEDIUM";
  }
}

function urgencyColor(urgency: WeakNode["urgency"]): string {
  switch (urgency) {
    case "critical":
      return "text-red-400";
    case "high":
      return "text-orange-400";
    case "medium":
      return "text-[var(--color-text-muted)]";
  }
}

export function AttentionCard({ weakNodes, onStudy }: AttentionCardProps) {
  const flagged = weakNodes.slice(0, 3);

  if (flagged.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="flex flex-col border rounded-md border-[var(--color-border-default)] bg-[var(--color-surface)] p-4"
      >
        <p className="kl-data-label">Flagged</p>
        <p className="mt-4 text-center font-mono text-xs text-[var(--color-text-muted)]">
          NO FLAGS — ALL CLEAR
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="flex flex-col border border-[var(--color-border-default)] bg-[var(--color-surface)] p-4"
    >
      <div className="flex items-center justify-between">
        <p className="kl-data-label">Flagged</p>
        <span className="font-mono text-[10px] font-bold text-orange-400">
          {flagged.length}
        </span>
      </div>

      <div className="mt-3 space-y-0">
        {flagged.map((node, i) => (
          <div key={node.id}>
            {i > 0 && <div className="kl-divider" />}
            <button
              type="button"
              className="flex w-full items-center justify-between py-2 text-left transition-colors hover:bg-[var(--color-surface-elevated)]"
              onClick={() => onStudy([node.id])}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                  {node.title}
                </p>
                <p className={`font-mono text-[10px] font-bold uppercase tracking-wider ${urgencyColor(node.urgency)}`}>
                  {urgencyLabel(node.urgency)}
                </p>
              </div>
              <span className="ml-3 shrink-0 font-mono text-xs font-bold tabular-nums text-[var(--color-text-muted)]">
                {Math.round(node.masteryScore * 100)}%
              </span>
            </button>
          </div>
        ))}
      </div>

      {flagged.length > 1 && (
        <button
          type="button"
          className="mt-2 self-end font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent-primary)] transition-colors hover:text-[var(--color-text-primary)]"
          onClick={() => onStudy(flagged.map((n) => n.id))}
        >
          STUDY ALL [{flagged.length}]
        </button>
      )}
    </motion.div>
  );
}
