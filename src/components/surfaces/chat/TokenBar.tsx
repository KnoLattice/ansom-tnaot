"use client";

import { cn } from "@/lib/utils";
import { useChatTokenUsage } from "@/lib/hooks";

interface TokenBarProps {
  className?: string;
  compact?: boolean;
}

export function TokenBar({ className, compact = false }: TokenBarProps) {
  const { data: usage } = useChatTokenUsage();

  if (!usage) return null;

  const isWarning = usage.percentUsed >= 80;
  const isBlocked = usage.remaining <= 0;

  return (
    <div
      className={cn(
        "flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider",
        compact ? "px-2 py-1" : "px-4 py-2",
        isBlocked
          ? "text-[var(--color-destructive)]"
          : isWarning
            ? "text-amber-400"
            : "text-[var(--color-text-muted)]",
        className,
      )}
    >
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--color-border-default)]">
        <div
          className={cn(
            "h-full transition-all duration-300",
            isBlocked
              ? "bg-[var(--color-destructive)]"
              : isWarning
                ? "bg-amber-400"
                : "bg-[var(--color-accent-primary)]",
          )}
          style={{ width: `${Math.min(100, usage.percentUsed)}%` }}
        />
      </div>
      <span className="shrink-0 tabular-nums">
        {usage.remaining.toLocaleString()} LEFT
      </span>
    </div>
  );
}
