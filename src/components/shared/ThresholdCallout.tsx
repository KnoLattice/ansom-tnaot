"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trophy } from "lucide-react";
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
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={cn(
            "flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3",
            className,
          )}
        >
          <Trophy className="h-4 w-4 shrink-0 text-emerald-600" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">
              Concept mastered!
            </p>
            <p className="text-xs text-emerald-600">
              You&apos;ve reached proficiency in &ldquo;{title}&rdquo;
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
