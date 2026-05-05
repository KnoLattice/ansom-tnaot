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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="flex min-h-[40vh] items-center justify-center"
        >
          <div className="border border-[var(--color-border-default)] bg-[var(--color-surface)] p-8 text-center">
            <p className="kl-data-label">Switching to</p>
            <h2 className="mt-3 font-mono text-xl font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
              {conceptName}
            </h2>
            <p className="mt-3 font-mono text-sm text-[var(--color-text-secondary)]">
              Current mastery:{" "}
              <span className="font-bold tabular-nums" style={{ color }}>
                {formatMastery(masteryScore)}
              </span>
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
