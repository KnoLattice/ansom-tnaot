"use client";

import { motion, useInView } from "framer-motion";
import { useState, useRef } from "react";
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
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
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

  const barRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(barRef, { once: true, margin: "-40px" });
  console.log("MasteryBar render", { score, previousScore,color, percent, delta, isInView });

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center gap-2">
        <div
          ref={barRef}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Mastery ${percent}%`}
          className={cn("relative w-full overflow-hidden rounded-full bg-[#E5E7EB]", sizeClasses[size])}
        >
          <motion.div
          key={score} // Reset animation when score changes
            className="relative h-full overflow-hidden rounded-full"
            initial={{ width: `${startPercent}%` }}
            animate={isInView ? { width: `${percent}%` } : { width: `${startPercent}%` }}
            transition={{
              duration: animated ? MASTERY_ANIMATION.barFillDuration : 0,
              ease: [0.16, 1, 0.3, 1],
            }}
            onAnimationComplete={() => setAnimationDone(true)}
            style={{ backgroundColor: color }}
          >
            {/* Shimmer highlight sweep */}
            {animated && (
              <motion.div
                className="absolute inset-0"
                initial={{ x: "-100%" }}
                animate={isInView ? { x: "200%" } : { x: "-100%" }}
                transition={{
                  delay: MASTERY_ANIMATION.barFillDuration * 0.6,
                  duration: 0.8,
                  ease: "easeInOut",
                }}
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
                  width: "50%",
                }}
              />
            )}
          </motion.div>
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

