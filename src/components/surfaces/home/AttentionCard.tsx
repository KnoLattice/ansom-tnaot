"use client";

import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import type { WeakNode } from "@/lib/types/api";

interface AttentionCardProps {
  weakNodes: WeakNode[];
  onStudy: (nodeIds: string[]) => void;
}

function urgencyLabel(urgency: WeakNode["urgency"]): string {
  switch (urgency) {
    case "critical":
      return "Critical";
    case "high":
      return "High";
    case "medium":
      return "Medium";
  }
}

function urgencyDot(urgency: WeakNode["urgency"]): string {
  switch (urgency) {
    case "critical":
      return "bg-red-500";
    case "high":
      return "bg-amber-500";
    case "medium":
      return "bg-[var(--color-text-muted)]";
  }
}

export function AttentionCard({ weakNodes, onStudy }: AttentionCardProps) {
  const flagged = weakNodes.slice(0, 3);

  if (flagged.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
        className="flex flex-col items-center justify-center rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6 shadow-soft-sm"
      >
        <div className="rounded-full bg-emerald-50 p-3">
          <AlertCircle className="h-5 w-5 text-emerald-500" />
        </div>
        <p className="mt-3 text-sm font-medium text-[var(--color-text-primary)]">
          All clear
        </p>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          No concepts need urgent attention
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
      className="flex flex-col rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6 shadow-soft-sm"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          Needs Attention
        </p>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700">
          {flagged.length}
        </span>
      </div>

      <div className="mt-4 space-y-1">
        {flagged.map((node, i) => (
          <button
            key={node.id}
            type="button"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[var(--color-surface-elevated)]"
            onClick={() => onStudy([node.id])}
          >
            <span className={`h-2 w-2 shrink-0 rounded-full ${urgencyDot(node.urgency)}`} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                {node.title}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {urgencyLabel(node.urgency)} priority
              </p>
            </div>
            <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-[var(--color-text-secondary)]">
              {Math.round(node.masteryScore * 100)}%
            </span>
          </button>
        ))}
      </div>

      {flagged.length > 1 && (
        <button
          type="button"
          className="mt-3 self-end rounded-lg bg-[var(--color-accent-primary)]/10 px-3.5 py-1.5 text-xs font-semibold text-[var(--color-accent-primary)] transition-colors hover:bg-[var(--color-accent-primary)]/20"
          onClick={() => onStudy(flagged.map((n) => n.id))}
        >
          Study all {flagged.length}
        </button>
      )}
    </motion.div>
  );
}
