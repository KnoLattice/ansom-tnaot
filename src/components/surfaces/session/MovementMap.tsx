"use client";

import { motion } from "framer-motion";
import type { NodeStudied } from "@/lib/types/api";
import { MasteryBar } from "@/components/shared/MasteryBar";
import { DeltaBadge } from "@/components/shared/DeltaBadge";
import { MASTERY_ANIMATION } from "@/lib/constants/mastery";
import { formatMastery } from "@/lib/utils/mastery";

interface MovementMapProps {
  nodes: NodeStudied[];
  nodeTitles: Record<string, string>;
}

export function MovementMap({ nodes, nodeTitles }: MovementMapProps) {
  const sorted = [...nodes].sort(
    (a, b) => Math.abs(b.delta) - Math.abs(a.delta),
  );

  return (
    <div className="space-y-2">
      <p className="kl-data-label">Concept Movement</p>
      <div className="space-y-0">
        {sorted.map((node, index) => (
          <motion.div
            key={node.nodeId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: index * (MASTERY_ANIMATION.listStagger * 0.8),
              duration: 0.15,
            }}
            className="flex items-center gap-3 border-b border-[var(--color-border-subtle)] px-4 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                {nodeTitles[node.nodeId] ?? node.nodeId.slice(0, 8)}
              </p>
              <div className="mt-0.5 flex items-center gap-2 font-mono text-[10px] tabular-nums text-[var(--color-text-muted)]">
                <span>{formatMastery(node.masteryBefore)}</span>
                <span>&rarr;</span>
                <span className="font-bold text-[var(--color-text-primary)]">
                  {formatMastery(node.masteryAfter)}
                </span>
              </div>
            </div>

            <div className="hidden w-32 sm:block">
              <MasteryBar
                score={node.masteryAfter}
                previousScore={node.masteryBefore}
                size="xs"
                animated
              />
            </div>

            <div className="w-16 text-right">
              <DeltaBadge delta={node.delta} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
