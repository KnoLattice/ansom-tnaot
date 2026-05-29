"use client";

import { motion } from "framer-motion";
import type { EndSessionResponse } from "@/lib/types/api";
import { formatDuration } from "@/lib/utils/format";
import { MASTERY_CALLOUT_THRESHOLD } from "@/lib/constants/mastery";

interface HeadlineMomentProps {
  summary: EndSessionResponse;
  nodeTitles: Record<string, string>;
}

function pickHeadline(
  summary: EndSessionResponse,
  nodeTitles: Record<string, string>,
): string {
  const { nodesStudied } = summary;
  if (nodesStudied.length === 0) return "Session Complete";

  const mastered = nodesStudied.filter(
    (n) =>
      n.masteryBefore < MASTERY_CALLOUT_THRESHOLD &&
      n.masteryAfter >= MASTERY_CALLOUT_THRESHOLD,
  );
  if (mastered.length > 0) {
    const name = nodeTitles[mastered[0].nodeId] ?? "a concept";
    return mastered.length === 1
      ? `🎉 Mastered: ${name}`
      : `🎉 Mastered ${mastered.length} concepts!`;
  }

  const sorted = [...nodesStudied].sort(
    (a, b) => Math.abs(b.delta) - Math.abs(a.delta),
  );
  const biggest = sorted[0];
  if (biggest && biggest.delta > 0) {
    const name = nodeTitles[biggest.nodeId] ?? "a concept";
    const delta = `+${Math.round(biggest.delta * 100)}%`;
    return `Biggest gain: ${name} (${delta})`;
  }

  if (nodesStudied.every((n) => n.delta >= 0)) {
    return "All concepts improved! 🚀";
  }

  return "Session Complete";
}

export function HeadlineMoment({ summary, nodeTitles }: HeadlineMomentProps) {
  const headline = pickHeadline(summary, nodeTitles);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="border-b border-[var(--color-border-subtle)] pb-6 text-center"
    >
      <h1 className="bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] bg-clip-text text-2xl font-bold tracking-tight text-transparent">
        {headline}
      </h1>
      <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
        {summary.totalInteractions} question{summary.totalInteractions !== 1 ? "s" : ""} ·{" "}
        {summary.accuracy}% accuracy ·{" "}
        {formatDuration(summary.durationMs)}
      </p>
    </motion.div>
  );
}
