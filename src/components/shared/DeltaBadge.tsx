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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        delay: MASTERY_ANIMATION.deltaBadgeDelay,
        duration: 0.2,
      }}
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 font-mono text-xs font-semibold tabular-nums",
        isPositive
          ? "bg-emerald-50 text-emerald-600"
          : "bg-red-50 text-red-600",
        className,
      )}
    >
      {label}
    </motion.span>
  );
}
