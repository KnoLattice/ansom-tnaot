"use client";

import { cn } from "@/lib/utils";

interface SessionProgressIndicatorProps {
  current: number;
  total: number;
  correctCount: number;
  className?: string;
}

export function SessionProgressIndicator({
  current,
  total,
  correctCount,
  className,
}: SessionProgressIndicatorProps) {
  const progress = total > 0 ? (current / total) * 100 : 0;
  const accuracy = current > 0 ? Math.round((correctCount / current) * 100) : 0;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-elevated)]">
          <div
            className="h-full rounded-full bg-[var(--color-accent-primary)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 text-xs tabular-nums text-[var(--color-text-muted)]">
        <span className="font-medium text-[var(--color-text-secondary)]">
          {current}/{total}
        </span>
        <span className="text-[var(--color-border-default)]">&middot;</span>
        <span className={cn(
          "font-medium",
          accuracy >= 70 ? "text-emerald-600" : accuracy >= 40 ? "text-amber-600" : "text-red-600",
        )}>
          {accuracy}%
        </span>
      </div>
    </div>
  );
}
