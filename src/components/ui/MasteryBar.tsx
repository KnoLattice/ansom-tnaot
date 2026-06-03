"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatMastery, getMasteryColor } from "@/lib/utils/mastery";
import type { MasteryBand } from "@/lib/types/api";

type MasterySize = "xs" | "sm" | "md";

interface MasteryBarProps {
  score: number;
  band?: MasteryBand;
  size?: MasterySize;
  showLabel?: boolean;
  showDelta?: boolean;
  previousScore?: number;
  animated?: boolean;
  className?: string;
}

const sizeClasses: Record<MasterySize, string> = {
  xs: "h-1",
  sm: "h-1.5",
  md: "h-2",
};

export function MasteryBar({
  score,
  band,
  size = "xs",
  showLabel = false,
  animated = true,
  className,
}: MasteryBarProps) {
  const percent = Math.min(100, Math.max(0, Math.round(score * 100)));
  const color = band ? getMasteryColor(band) : undefined;

  return (
    <div className={cn("w-full space-y-1", className)}>
      <div className={cn("w-full bg-[var(--color-border-subtle)]", sizeClasses[size])}>
        <motion.div
          initial={{ width: animated ? 0 : `${percent}%` }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.3 }}
          className="h-full"
          style={{ backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <p className="font-mono text-[10px] font-bold tabular-nums text-[var(--color-text-muted)]">
          {formatMastery(score)}
        </p>
      )}
    </div>
  );
}
