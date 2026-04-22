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
  if (nodesStudied.length === 0) return "Session complete.";

  // Check for mastered threshold crossings
  const mastered = nodesStudied.filter(
    (n) =>
      n.masteryBefore < MASTERY_CALLOUT_THRESHOLD &&
      n.masteryAfter >= MASTERY_CALLOUT_THRESHOLD,
  );
  if (mastered.length > 0) {
    const name = nodeTitles[mastered[0].nodeId] ?? "a concept";
    return mastered.length === 1
      ? `You mastered ${name}.`
      : `You mastered ${mastered.length} concepts.`;
  }

  // Biggest gain
  const sorted = [...nodesStudied].sort(
    (a, b) => Math.abs(b.delta) - Math.abs(a.delta),
  );
  const biggest = sorted[0];
  if (biggest && biggest.delta > 0) {
    const name = nodeTitles[biggest.nodeId] ?? "a concept";
    const delta = `+${Math.round(biggest.delta * 100)}%`;
    return `Biggest gain: ${name} (${delta}).`;
  }

  // All improved
  if (nodesStudied.every((n) => n.delta >= 0)) {
    return "You improved every concept you touched.";
  }

  return "Good study session.";
}

export function HeadlineMoment({ summary, nodeTitles }: HeadlineMomentProps) {
  const headline = pickHeadline(summary, nodeTitles);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="text-center"
    >
      <h1 className="font-display text-3xl font-bold text-white">
        {headline}
      </h1>
      <p className="mt-3 text-sm text-text-secondary">
        {summary.totalInteractions} question{summary.totalInteractions !== 1 ? "s" : ""} ·{" "}
        {summary.accuracy}% accuracy ·{" "}
        {formatDuration(summary.durationMs)}
      </p>
    </motion.div>
  );
}
