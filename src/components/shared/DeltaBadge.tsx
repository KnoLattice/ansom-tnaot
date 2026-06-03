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
        "inline-flex items-center rounded-full px-2 py-0.5 font-poppins text-[11px] font-bold tabular-nums",
        isPositive
          ? "bg-[var(--color-accent-secondary)]/10 text-[var(--color-accent-secondary)]"
          : "bg-[var(--color-status-danger)]/10 text-[var(--color-status-danger)]",
        className,
      )}
    >
      {label}
    </motion.span>
  );
}
