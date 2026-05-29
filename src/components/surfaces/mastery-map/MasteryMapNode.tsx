"use client";

import type { NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import { Lock } from "lucide-react";
import type { GraphNode } from "@/lib/types/api";
import { getMasteryTierColor } from "@/lib/constants/mastery";
import { cn } from "@/lib/utils";

type MasteryMapNodePayload = { node: GraphNode };

export function MasteryMapNode({ data, selected }: NodeProps) {
  const node = (data as MasteryMapNodePayload).node;
  const locked = node.isLocked;
  const color = locked ? "#D4D4D2" : getMasteryTierColor(node.masteryScore);
  const percent = Math.round(node.masteryScore * 100);

  return (
    <div className="flex items-center gap-2.5">
      {/* Node indicator — circular for modern feel */}
      <div className="relative flex shrink-0 items-center justify-center">
        <Handle
          type="target"
          position={Position.Top}
          className="!absolute !left-1/2 !top-0 !h-0 !w-0 !min-h-0 !min-w-0 !-translate-x-1/2 !border-0 !bg-transparent"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="!absolute !bottom-0 !left-1/2 !h-0 !w-0 !min-h-0 !min-w-0 !-translate-x-1/2 !border-0 !bg-transparent"
        />

        {/* Selection ring — circular pulse */}
        {selected && (
          <div
            className="absolute inset-[-5px] rounded-full opacity-25"
            style={{
              backgroundColor: color,
              animation: "gentlePulse 2s ease-in-out infinite",
            }}
          />
        )}

        {/* Circle node */}
        <div
          className={cn(
            "relative z-10 flex items-center justify-center rounded-full transition-all duration-200",
            selected ? "h-8 w-8 shadow-md" : locked ? "h-4 w-4" : "h-6 w-6 shadow-sm",
          )}
          style={{ backgroundColor: color }}
        >
          {locked && <Lock className="h-2.5 w-2.5 text-white/60" />}
        </div>
      </div>

      {/* Label */}
      <div className="flex flex-col">
        <span
          className={cn(
            "max-w-[9rem] truncate text-xs leading-tight transition-colors",
            selected
              ? "font-bold text-[var(--color-text-primary)]"
              : locked
                ? "font-medium text-[var(--color-text-muted)]"
                : "font-medium text-[var(--color-text-secondary)]",
          )}
          title={node.title}
        >
          {node.title}
        </span>
        {!locked && (
          <span
            className="text-[10px] font-semibold tabular-nums leading-tight"
            style={{ color }}
          >
            {percent}%
          </span>
        )}
      </div>
    </div>
  );
}
