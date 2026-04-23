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
  const color = locked ? "#4b5563" : getMasteryTierColor(node.masteryScore);
  const percent = Math.round(node.masteryScore * 100);

  return (
    <div className="flex items-center gap-2.5">
      {/* Dot wrapper — handles are positioned relative to this so edges connect to the dot center */}
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

        {/* Selection ring */}
        {selected && (
          <div
            className="absolute inset-[-5px] rounded-full opacity-30"
            style={{ backgroundColor: color }}
          />
        )}

        {/* Solid dot */}
        <div
          className={cn(
            "relative z-10 flex items-center justify-center rounded-full transition-all",
            selected ? "h-8 w-8" : locked ? "h-5 w-5" : "h-6 w-6",
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
              ? "font-semibold text-white"
              : locked
                ? "font-medium text-text-muted"
                : "font-medium text-text-secondary",
          )}
          title={node.title}
        >
          {node.title}
        </span>
        {!locked && (
          <span
            className={cn(
              "text-[10px] tabular-nums leading-tight transition-colors",
              selected ? "font-bold" : "font-normal",
            )}
            style={{ color }}
          >
            {percent}%
          </span>
        )}
      </div>
    </div>
  );
}
