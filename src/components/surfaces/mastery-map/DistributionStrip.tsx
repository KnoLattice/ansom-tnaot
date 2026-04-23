"use client";

import type { GraphNode } from "@/lib/types/api";
import { cn } from "@/lib/utils";

interface DistributionStripProps {
  nodes: GraphNode[];
  className?: string;
}

export function DistributionStrip({ nodes, className }: DistributionStripProps) {
  const total = nodes.length;
  if (total === 0) return null;

  const mastered = nodes.filter((n) => n.masteryScore >= 0.7).length;
  const inProgress = nodes.filter((n) => !n.isLocked && n.masteryScore >= 0.3 && n.masteryScore < 0.7).length;
  const needsWork = nodes.filter((n) => !n.isLocked && n.masteryScore < 0.3).length;
  const locked = nodes.filter((n) => n.isLocked).length;

  const segments = [
    { count: mastered, color: "bg-green-500", label: "Mastered" },
    { count: inProgress, color: "bg-yellow-500", label: "In progress" },
    { count: needsWork, color: "bg-red-500", label: "Needs work" },
    { count: locked, color: "bg-slate-500", label: "Locked" },
  ].filter((s) => s.count > 0);

  return (
    <div className={cn("space-y-2", className)}>
      {/* Bar */}
      <div className="flex h-2 overflow-hidden rounded-full bg-white/10">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={cn("h-full transition-all", seg.color)}
            style={{ width: `${(seg.count / total) * 100}%` }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
        {segments.map((seg) => (
          <span key={seg.label} className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", seg.color)} />
            {seg.label} ({seg.count})
          </span>
        ))}
      </div>
    </div>
  );
}
