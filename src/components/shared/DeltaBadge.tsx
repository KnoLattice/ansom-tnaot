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
        duration: 0.15,
      }}
      className={cn(
        "inline-flex items-center border px-2 py-0.5 font-mono text-[10px] font-bold tabular-nums",
        isPositive
          ? "border-green-500 text-green-400"
          : "border-red-500 text-red-400",
        className,
      )}
    >
      {label}
    </motion.span>
  );
}
