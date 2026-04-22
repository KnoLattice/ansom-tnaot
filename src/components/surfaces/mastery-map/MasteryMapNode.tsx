"use client";

import type { NodeProps } from "@xyflow/react";
import { Lock } from "lucide-react";
import type { GraphNode } from "@/lib/types/api";
import { getMasteryTierColor } from "@/lib/constants/mastery";
import { cn } from "@/lib/utils";

type MasteryMapNodePayload = { node: GraphNode };

export function MasteryMapNode({ data }: NodeProps) {
  const node = (data as MasteryMapNodePayload).node;
  const locked = node.isLocked;
  const color = locked ? "#374151" : getMasteryTierColor(node.masteryScore);
  const percent = Math.round(node.masteryScore * 100);

  return (
    <div
      className={cn(
        "relative flex h-28 w-28 flex-col items-center justify-center rounded-full text-center text-xs font-semibold text-white transition",
        locked && "opacity-60",
      )}
      style={{
        background: `radial-gradient(circle, ${color}40 0%, rgba(12,12,24,0.85) 70%)`,
        boxShadow: locked ? "none" : `0 0 24px ${color}50`,
        border: locked
          ? "1.5px dashed rgba(255,255,255,0.2)"
          : `1.5px solid ${color}60`,
      }}
    >
      {locked && (
        <Lock className="mb-1 h-3.5 w-3.5 text-text-muted" />
      )}
      <span className="max-w-[5.5rem] truncate px-2 leading-snug" title={node.title}>
        {node.title}
      </span>
      {!locked && (
        <span
          className="mt-1 text-[10px] font-bold tabular-nums"
          style={{ color }}
        >
          {percent}%
        </span>
      )}
    </div>
  );
}
