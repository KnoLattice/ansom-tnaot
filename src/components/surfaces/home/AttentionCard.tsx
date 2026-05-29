"use client";

import { motion } from "framer-motion";
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
      return "bg-red-500/10 text-red-500";
    case "high":
      return "bg-orange-500/10 text-orange-500";
    case "medium":
      return "bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]";
  }
}

export function AttentionCard({ weakNodes, onStudy }: AttentionCardProps) {
  const flagged = weakNodes.slice(0, 3);

  if (flagged.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        className="flex flex-col rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5 shadow-sm"
      >
        <p className="kl-data-label">Needs Attention</p>
        <p className="mt-4 text-center text-sm text-[var(--color-text-muted)]">
          ✓ All clear — no flagged concepts
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
      className="flex flex-col rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <p className="kl-data-label">Needs Attention</p>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/10 text-[10px] font-bold text-orange-500">
          {flagged.length}
        </span>
      </div>

      <div className="mt-3 space-y-1">
        {flagged.map((node, i) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.15 + i * 0.05 }}
          >
            {i > 0 && <div className="kl-divider" />}
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-lg py-2.5 px-2 text-left transition-all duration-200 hover:bg-[var(--color-surface-elevated)]"
              onClick={() => onStudy([node.id])}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                  {node.title}
                </p>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${urgencyColor(node.urgency)}`}>
                  {urgencyLabel(node.urgency)}
                </span>
              </div>
              <span className="ml-3 shrink-0 text-xs font-bold tabular-nums text-[var(--color-text-muted)]">
                {Math.round(node.masteryScore * 100)}%
              </span>
            </button>
          </motion.div>
        ))}
      </div>

      {flagged.length > 1 && (
        <button
          type="button"
          className="mt-3 self-end rounded-lg px-3 py-1.5 text-xs font-semibold text-[var(--color-accent-primary)] transition-all duration-200 hover:bg-[var(--color-accent-primary)]/10"
          onClick={() => onStudy(flagged.map((n) => n.id))}
        >
          Study all {flagged.length} →
        </button>
      )}
    </motion.div>
  );
}
