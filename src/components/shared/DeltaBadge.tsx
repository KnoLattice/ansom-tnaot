"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MASTERY_ANIMATION } from "@/lib/constants/mastery";

interface DeltaBadgeProps {
  delta: number;
  className?: string;
}

export function DeltaBadge({ delta, className }: DeltaBadgeProps) {
  const pct = Math.round(delta * 100);
  if (pct === 0) return null;

  const isPositive = pct > 0;
  const label = `${isPositive ? "+" : ""}${pct}%`;

  return (
    <motion.span
      initial={{ opacity: 0, y: 4, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: MASTERY_ANIMATION.deltaBadgeDelay,
        duration: MASTERY_ANIMATION.deltaBadgeDuration,
      }}
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
        isPositive
          ? "bg-green-500/15 text-green-400"
          : "bg-red-500/15 text-red-400",
        className,
      )}
    >
      {label}
    </motion.span>
  );
}
