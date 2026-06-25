"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { getMasteryTierColor } from "@/lib/constants/mastery";
import { MasterySparkline } from "@/components/shared/MasterySparkline";
import { interpretTrajectory } from "@/lib/utils/trajectory";

interface PulseCardProps {
  overallMasteryPercent: number;
  weeklyDelta?: number;
  sparklineData: number[];
}

export function PulseCard({
  overallMasteryPercent,
  weeklyDelta,
  sparklineData,
}: PulseCardProps) {
  const masteryFraction = overallMasteryPercent / 100;
  const color = getMasteryTierColor(masteryFraction);
  const trajectory = interpretTrajectory(sparklineData);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col justify-between rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6 shadow-soft-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          Overall Mastery
        </p>
        <TrendingUp className="h-4 w-4 text-[var(--color-text-muted)]" />
      </div>

      {/* Big number — serif display */}
      <div className="mt-4 flex items-baseline gap-3">
        <span
          className="font-display text-6xl tracking-tight"
          style={{ color }}
        >
          {Math.round(overallMasteryPercent)}%
        </span>
        {weeklyDelta != null && (
          <span
            className={`rounded-full px-2.5 py-0.5 font-mono text-xs font-semibold tabular-nums ${
              weeklyDelta > 0
                ? "bg-emerald-50 text-emerald-600"
                : weeklyDelta < 0
                  ? "bg-red-50 text-red-600"
                  : "bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]"
            }`}
          >
            {weeklyDelta > 0 ? "+" : ""}
            {weeklyDelta}% this week
          </span>
        )}
      </div>

      {/* Progress bar — rounded, warm */}
      <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-elevated)]">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${overallMasteryPercent}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ backgroundColor: color }}
        />
      </div>

      {/* Sparkline */}
      {sparklineData.length > 1 && (
        <div className="mt-4">
          <MasterySparkline data={sparklineData} height={44} />
        </div>
      )}

      <p className="mt-3 text-xs text-[var(--color-text-muted)]">
        {trajectory}
      </p>
    </motion.div>
  );
}
