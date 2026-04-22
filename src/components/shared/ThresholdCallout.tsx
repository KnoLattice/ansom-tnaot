"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MASTERY_CALLOUT_THRESHOLD } from "@/lib/constants/mastery";

interface ThresholdCalloutProps {
  /** Score before the interaction */
  previousScore: number;
  /** Score after the interaction */
  currentScore: number;
  /** Concept title */
  title: string;
  className?: string;
}

export function ThresholdCallout({
  previousScore,
  currentScore,
  title,
  className,
}: ThresholdCalloutProps) {
  const justCrossed =
    previousScore < MASTERY_CALLOUT_THRESHOLD &&
    currentScore >= MASTERY_CALLOUT_THRESHOLD;

  return (
    <AnimatePresence>
      {justCrossed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -4 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-center",
            className,
          )}
        >
          <p className="text-sm font-semibold text-green-400">
            Concept mastered!
          </p>
          <p className="mt-0.5 text-xs text-green-400/70">
            You&apos;ve reached proficiency in &ldquo;{title}&rdquo;
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
