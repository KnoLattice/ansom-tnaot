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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="flex flex-col justify-between border border-[var(--color-border-default)] bg-[var(--color-surface)] p-4"
    >
      {/* Header label */}
      <p className="kl-data-label">Overall Mastery</p>

      {/* Big number readout */}
      <div className="mt-3 flex items-baseline gap-3">
        <span
          className="kl-data-value text-5xl"
          style={{ color }}
        >
          {Math.round(overallMasteryPercent)}
        </span>
        <span className="kl-data-label" style={{ color }}>%</span>
        {weeklyDelta != null && (
          <span
            className={`font-mono text-xs font-bold tabular-nums ${
              weeklyDelta > 0
                ? "text-[var(--color-accent-primary)]"
                : weeklyDelta < 0
                  ? "text-red-400"
                  : "text-[var(--color-text-muted)]"
            }`}
          >
            {weeklyDelta > 0 ? "+" : ""}
            {weeklyDelta}% /wk
          </span>
        )}
      </div>

      {/* Progress bar — raw, no radius */}
      <div className="mt-4 h-1.5 w-full bg-[var(--color-border-subtle)]">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${overallMasteryPercent}%`,
            backgroundColor: color,
          }}
        />
      </div>

      {/* Sparkline */}
      {sparklineData.length > 1 && (
        <div className="mt-3">
          <MasterySparkline data={sparklineData} height={40} />
        </div>
      )}

      <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
        {trajectory}
      </p>
    </motion.div>
  );
}
