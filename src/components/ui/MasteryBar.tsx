"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { formatMastery, getMasteryColor } from "@/lib/utils/mastery";
import type { MasteryBand } from "@/lib/types/api";

type MasterySize = "xs" | "sm" | "md";

interface MasteryBarProps {
  score: number;
  band?: MasteryBand;
  size?: MasterySize;
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

const sizeClasses: Record<MasterySize, string> = {
  xs: "h-2",
  sm: "h-3",
  md: "h-4",
};

export function MasteryBar({
  score,
  band,
  size = "sm",
  showLabel = false,
  animated = true,
  className,
}: MasteryBarProps) {
  const percent = Math.min(100, Math.max(0, Math.round(score * 100)));
  const color = band ? getMasteryColor(band) : undefined;

  return (
    <div className={cn("w-full space-y-1", className)}>
      <div className={cn("w-full rounded-full bg-muted", sizeClasses[size])}>
        <motion.div
          initial={{ width: animated ? 0 : `${percent}%` }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.4 }}
          className={cn("h-full rounded-full")}
          style={{ backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <p className="text-xs font-medium text-muted-foreground">
          {formatMastery(score)}
        </p>
      )}
    </div>
  );
}
