"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MASTERY_CALLOUT_THRESHOLD } from "@/lib/constants/mastery";

interface ThresholdCalloutProps {
  previousScore: number;
  currentScore: number;
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "border-l-2 border-l-green-500 bg-green-500/10 px-4 py-3",
            className,
          )}
        >
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-green-400">
            CONCEPT MASTERED
          </p>
          <p className="mt-0.5 text-xs text-green-400/70">
            You&apos;ve reached proficiency in &ldquo;{title}&rdquo;
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
