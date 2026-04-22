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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.05 }}
      className="flex flex-col justify-between rounded-2xl border border-white/8 bg-white/[0.03] p-6"
    >
      <div>
        <p className="text-xs uppercase tracking-widest text-text-muted">
          Overall Mastery
        </p>
        <div className="mt-2 flex items-baseline gap-3">
          <span
            className="font-display text-5xl font-bold tabular-nums"
            style={{ color }}
          >
            {Math.round(overallMasteryPercent)}%
          </span>
          {weeklyDelta != null && (
            <span
              className={`text-sm font-medium tabular-nums ${
                weeklyDelta > 0
                  ? "text-green-400"
                  : weeklyDelta < 0
                    ? "text-red-400"
                    : "text-text-muted"
              }`}
            >
              {weeklyDelta > 0 ? "+" : ""}
              {weeklyDelta}% this week
            </span>
          )}
        </div>
      </div>

      {sparklineData.length > 1 && (
        <div className="mt-4">
          <MasterySparkline data={sparklineData} height={48} />
        </div>
      )}

      <p className="mt-3 text-xs text-text-muted">{trajectory}</p>
    </motion.div>
  );
}
