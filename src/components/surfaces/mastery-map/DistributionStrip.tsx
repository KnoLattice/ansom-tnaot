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
    { count: mastered, color: "bg-emerald-500", dotColor: "bg-emerald-500", label: "Mastered" },
    { count: inProgress, color: "bg-amber-500", dotColor: "bg-amber-500", label: "In progress" },
    { count: needsWork, color: "bg-red-500", dotColor: "bg-red-500", label: "Needs work" },
    { count: locked, color: "bg-[var(--color-border-default)]", dotColor: "bg-[var(--color-border-default)]", label: "Locked" },
  ].filter((s) => s.count > 0);

  return (
    <div className={cn("space-y-3 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4 shadow-soft-sm", className)}>
      {/* Bar */}
      <div className="flex h-2.5 overflow-hidden rounded-full bg-[var(--color-surface-elevated)]">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={cn("h-full transition-all first:rounded-l-full last:rounded-r-full", seg.color)}
            style={{ width: `${(seg.count / total) * 100}%` }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4">
        {segments.map((seg) => (
          <span key={seg.label} className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", seg.dotColor)} />
            <span className="text-xs text-[var(--color-text-muted)]">
              {seg.label} ({seg.count})
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
