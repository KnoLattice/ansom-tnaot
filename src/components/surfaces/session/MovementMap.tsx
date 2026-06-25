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
    <div className="space-y-1">
      {sorted.map((node, index) => (
        <motion.div
          key={node.nodeId}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: index * MASTERY_ANIMATION.listStagger,
            duration: 0.3,
            ease: "easeOut",
          }}
          className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-[var(--color-surface-elevated)]"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
              {nodeTitles[node.nodeId] ?? node.nodeId.slice(0, 8)}
            </p>
            <div className="mt-0.5 flex items-center gap-2 text-xs tabular-nums text-[var(--color-text-muted)]">
              <span>{formatMastery(node.masteryBefore)}</span>
              <span className="text-[var(--color-border-default)]">&rarr;</span>
              <span className="font-semibold text-[var(--color-text-primary)]">
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
  );
}
