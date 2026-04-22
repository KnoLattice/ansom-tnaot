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
  // Sort by absolute delta descending
  const sorted = [...nodes].sort(
    (a, b) => Math.abs(b.delta) - Math.abs(a.delta),
  );

  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-text-muted">
        Concept movement
      </p>
      <div className="space-y-1">
        {sorted.map((node, index) => (
          <motion.div
            key={node.nodeId}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: index * (MASTERY_ANIMATION.listStagger * 0.8),
              duration: 0.2,
            }}
            className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
          >
            {/* Concept name */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {nodeTitles[node.nodeId] ?? node.nodeId.slice(0, 8)}
              </p>
              <div className="mt-0.5 flex items-center gap-2 text-xs tabular-nums text-text-muted">
                <span>{formatMastery(node.masteryBefore)}</span>
                <span className="text-text-muted/50">→</span>
                <span className="font-medium text-white">
                  {formatMastery(node.masteryAfter)}
                </span>
              </div>
            </div>

            {/* Mastery bar with animation */}
            <div className="hidden w-32 sm:block">
              <MasteryBar
                score={node.masteryAfter}
                previousScore={node.masteryBefore}
                size="xs"
                animated
              />
            </div>

            {/* Delta badge */}
            <div className="w-16 text-right">
              <DeltaBadge delta={node.delta} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
