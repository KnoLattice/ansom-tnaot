"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getMasteryTierColor, MASTERY_ANIMATION } from "@/lib/constants/mastery";
import { formatMastery } from "@/lib/utils/mastery";
import { DeltaBadge } from "./DeltaBadge";

type MasterySize = "xs" | "sm" | "md" | "lg";

interface MasteryBarProps {
  score: number;
  previousScore?: number;
  size?: MasterySize;
  showLabel?: boolean;
  showDelta?: boolean;
  animated?: boolean;
  className?: string;
}

const sizeClasses: Record<MasterySize, string> = {
  xs: "h-1.5",
  sm: "h-2.5",
  md: "h-3.5",
  lg: "h-5",
};

export function MasteryBar({
  score,
  previousScore,
  size = "sm",
  showLabel = false,
  showDelta = false,
  animated = true,
  className,
}: MasteryBarProps) {
  const percent = Math.min(100, Math.max(0, Math.round(score * 100)));
  const color = getMasteryTierColor(score);
  const delta = previousScore !== undefined ? score - previousScore : undefined;
  const startPercent = animated && previousScore !== undefined ? Math.round(previousScore * 100) : 0;
  const [animationDone, setAnimationDone] = useState(!animated);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center gap-2">
        <div
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Mastery ${percent}%`}
          className={cn("relative w-full overflow-hidden rounded-full bg-white/10", sizeClasses[size])}
        >
          <motion.div
            className="h-full rounded-full"
            initial={{ width: animated ? `${startPercent}%` : `${percent}%` }}
            animate={{ width: `${percent}%` }}
            transition={{
              duration: MASTERY_ANIMATION.barFillDuration,
              ease: [0.16, 1, 0.3, 1],
            }}
            onAnimationComplete={() => setAnimationDone(true)}
            style={{ backgroundColor: color }}
          />
        </div>
        {showLabel && (
          <span className="shrink-0 text-xs font-medium tabular-nums text-text-secondary">
            {formatMastery(score)}
          </span>
        )}
        {showDelta && delta !== undefined && delta !== 0 && animationDone && (
          <DeltaBadge delta={delta} />
        )}
      </div>
    </div>
  );
}
