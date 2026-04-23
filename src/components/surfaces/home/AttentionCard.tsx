"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { ConceptTile } from "@/components/shared/ConceptTile";
import type { WeakNode } from "@/lib/types/api";

interface AttentionCardProps {
  weakNodes: WeakNode[];
  onStudy: (nodeIds: string[]) => void;
}

function urgencyLabel(urgency: WeakNode["urgency"]): string {
  switch (urgency) {
    case "critical":
      return "Needs urgent review";
    case "high":
      return "Falling behind";
    case "medium":
      return "Could use practice";
  }
}

export function AttentionCard({ weakNodes, onStudy }: AttentionCardProps) {
  const flagged = weakNodes.slice(0, 2);

  if (flagged.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.1 }}
        className="flex flex-col items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] p-6 text-center"
      >
        <p className="text-xs uppercase tracking-widest text-text-muted">
          Needs Attention
        </p>
        <p className="mt-4 text-sm text-text-secondary">
          No flagged concepts — keep it up!
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.1 }}
      className="flex flex-col rounded-2xl border border-white/8 bg-white/[0.03] p-6"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />
        <p className="text-xs uppercase tracking-widest text-text-muted">
          Needs Attention
        </p>
      </div>

      <div className="mt-4 space-y-2">
        {flagged.map((node) => (
          <ConceptTile
            key={node.id}
            title={node.title}
            masteryScore={node.masteryScore}
            subtitle={urgencyLabel(node.urgency)}
            onClick={() => onStudy([node.id])}
          />
        ))}
      </div>

      {flagged.length > 1 && (
        <button
          type="button"
          className="mt-3 self-end text-xs font-medium text-accent-primary underline underline-offset-4"
          onClick={() => onStudy(flagged.map((n) => n.id))}
        >
          Study both
        </button>
      )}
    </motion.div>
  );
}
