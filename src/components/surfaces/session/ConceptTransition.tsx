"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { formatMastery } from "@/lib/utils/mastery";
import { getMasteryTierColor } from "@/lib/constants/mastery";

interface ConceptTransitionProps {
  conceptName: string;
  masteryScore: number;
  onComplete: () => void;
}

export function ConceptTransition({
  conceptName,
  masteryScore,
  onComplete,
}: ConceptTransitionProps) {
  const [visible, setVisible] = useState(true);
  const prefersReduced = useReducedMotion();
  const color = getMasteryTierColor(masteryScore);

  useEffect(() => {
    // Skip transition delay if user prefers reduced motion
    const delay = prefersReduced ? 400 : 1800;
    const timer = setTimeout(() => {
      setVisible(false);
    }, delay);
    return () => clearTimeout(timer);
  }, [prefersReduced]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="flex min-h-[40vh] items-center justify-center"
        >
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-text-muted">
              Moving to
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-white">
              {conceptName}
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Current mastery:{" "}
              <span className="font-semibold tabular-nums" style={{ color }}>
                {formatMastery(masteryScore)}
              </span>
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
