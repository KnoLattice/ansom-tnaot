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
    <div className={cn("flex items-center gap-4", className)}>
      {/* Progress bar */}
      <div className="flex-1">
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-accent-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex shrink-0 items-center gap-3 text-xs tabular-nums text-text-secondary">
        <span>
          {current}/{total}
        </span>
        <span className="text-text-muted">|</span>
        <span className={cn(accuracy >= 70 ? "text-green-400" : accuracy >= 40 ? "text-yellow-400" : "text-red-400")}>
          {accuracy}% accuracy
        </span>
      </div>
    </div>
  );
}
