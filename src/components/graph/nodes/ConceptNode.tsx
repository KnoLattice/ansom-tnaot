"use client";

import type { NodeProps } from "@xyflow/react";
import type { GraphNode } from "@/lib/types/api";
import { cn } from "@/lib/utils";

type ConceptNodePayload = { node: GraphNode };

export function ConceptNode({ data }: NodeProps) {
  const node = (data as ConceptNodePayload).node;
  const band = node.masteryBand;
  const locked = node.isLocked;
  const colorVar = `var(--color-node-${locked ? "locked" : band})`;

  return (
    <div
      className={cn(
        "relative flex h-28 w-28 flex-col items-center justify-center rounded-full text-center text-xs font-semibold text-white shadow-glow transition",
        locked && "opacity-70",
      )}
      style={{
        background: `radial-gradient(circle, ${colorVar} 0%, rgba(12,12,24,0.9) 65%)`,
        boxShadow: `0 0 32px ${colorVar}`,
        border: locked ? "1px dashed rgba(255,255,255,0.3)" : "1px solid rgba(255,255,255,0.2)",
      }}
    >
      <span className="px-4 leading-snug" title={node.title}>
        {node.title.length > 18 ? `${node.title.slice(0, 18)}…` : node.title}
      </span>
      <span className="mt-1 text-[10px] uppercase tracking-[0.3em]">
        {locked ? "Locked" : `${Math.round(node.masteryScore * 100)}%`}
      </span>
    </div>
  );
}
