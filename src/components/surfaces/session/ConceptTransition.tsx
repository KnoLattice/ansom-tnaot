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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex min-h-[40vh] items-center justify-center"
        >
          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-10 text-center shadow-lg">
            <p className="kl-data-label">Switching to</p>
            <h2 className="mt-3 text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
              {conceptName}
            </h2>
            <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
              Current mastery:{" "}
              <span className="font-bold tabular-nums" style={{ color }}>
                {formatMastery(masteryScore)}
              </span>
            </p>
            {/* Animated glow ring */}
            <div
              className="mx-auto mt-4 h-1 w-16 rounded-full"
              style={{
                backgroundColor: color,
                opacity: 0.5,
                animation: "gentlePulse 1.5s ease-in-out infinite",
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
