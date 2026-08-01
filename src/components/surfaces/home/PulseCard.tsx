"use client";

import { motion } from "framer-motion";
import { getMasteryTierColor } from "@/lib/constants/mastery";
import { MasterySparkline } from "@/components/shared/MasterySparkline";
import { interpretTrajectory } from "@/lib/utils/trajectory";

interface PulseCardProps {
  overallMasteryPercent: number;
  /** Weekly delta in percentage points (e.g. +3 means 3% increase) */
  weeklyDelta?: number;
  /** Array of mastery scores (0-1) for the sparkline */
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
      transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
      className="kl-card kl-elevation-1"
    >
      {/* Header label */}
      <p className="kl-data-label">Overall Mastery</p>

      {/* Big number readout */}
      <div className="mt-4 flex items-baseline gap-3">
        <span
          className="kl-data-value text-5xl"
          style={{ color }}
        >
          {Math.round(overallMasteryPercent)}%
        </span>
        {weeklyDelta != null && (
          <span
            className={`text-sm font-semibold tabular-nums ${
              weeklyDelta > 0
                ? "text-[var(--color-accent-secondary)]"
                : weeklyDelta < 0
                  ? "text-red-500"
                  : "text-[var(--color-text-muted)]"
            }`}
          >
            {weeklyDelta > 0 ? "+" : ""}
            {weeklyDelta}% /wk
          </span>
        )}
      </div>

      {/* Progress bar with glow */}
      <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-border-subtle)]">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${overallMasteryPercent}%` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            backgroundColor: color,
            boxShadow: `0 0 10px 1px ${color}55, 0 0 4px 0px ${color}88`,
          }}
        />
      </div>

      {/* Sparkline */}
      {sparklineData.length > 1 && (
        <div className="mt-4">
          <MasterySparkline data={sparklineData} height={40} />
        </div>
      )}

      <p className="mt-3 text-xs text-[var(--color-text-muted)]">
        {trajectory}
      </p>
    </motion.div>
  );
}
