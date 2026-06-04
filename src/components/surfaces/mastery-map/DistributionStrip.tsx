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
    { count: mastered, color: "bg-[var(--color-accent-primary)]", label: "MASTERED" },
    { count: inProgress, color: "bg-yellow-500", label: "IN PROGRESS" },
    { count: needsWork, color: "bg-red-500", label: "NEEDS WORK" },
    { count: locked, color: "bg-[var(--color-border-default)]", label: "LOCKED" },
  ].filter((s) => s.count > 0);

  return (
    <div className={cn("space-y-2 rounded-md border border-[var(--color-border-default)] bg-[var(--color-surface)] p-4", className)}>
      {/* Bar — rounded */}
      <div className="flex h-2 overflow-hidden rounded-full bg-[var(--color-border-subtle)]">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={cn("h-full transition-all", seg.color)}
            style={{ width: `${(seg.count / total) * 100}%` }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4">
        {segments.map((seg) => (
          <span key={seg.label} className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", seg.color)} />
            <span className="font-poppins text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              {seg.label} ({seg.count})
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
