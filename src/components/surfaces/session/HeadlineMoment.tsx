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
  if (nodesStudied.length === 0) return "SESSION COMPLETE";

  const mastered = nodesStudied.filter(
    (n) =>
      n.masteryBefore < MASTERY_CALLOUT_THRESHOLD &&
      n.masteryAfter >= MASTERY_CALLOUT_THRESHOLD,
  );
  if (mastered.length > 0) {
    const name = nodeTitles[mastered[0].nodeId] ?? "a concept";
    return mastered.length === 1
      ? `MASTERED: ${name}`
      : `MASTERED ${mastered.length} CONCEPTS`;
  }

  const sorted = [...nodesStudied].sort(
    (a, b) => Math.abs(b.delta) - Math.abs(a.delta),
  );
  const biggest = sorted[0];
  if (biggest && biggest.delta > 0) {
    const name = nodeTitles[biggest.nodeId] ?? "a concept";
    const delta = `+${Math.round(biggest.delta * 100)}%`;
    return `BIGGEST GAIN: ${name} (${delta})`;
  }

  if (nodesStudied.every((n) => n.delta >= 0)) {
    return "ALL CONCEPTS IMPROVED";
  }

  return "SESSION COMPLETE";
}

export function HeadlineMoment({ summary, nodeTitles }: HeadlineMomentProps) {
  const headline = pickHeadline(summary, nodeTitles);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="border-b border-[var(--color-border-default)] pb-6 text-center"
    >
      <h1 className="font-mono text-xl font-bold uppercase tracking-wider text-[var(--color-accent-primary)]">
        {headline}
      </h1>
      <p className="mt-3 font-mono text-xs text-[var(--color-text-secondary)]">
        {summary.totalInteractions} Q{summary.totalInteractions !== 1 ? "S" : ""} /{" "}
        {summary.accuracy}% ACC /{" "}
        {formatDuration(summary.durationMs)}
      </p>
    </motion.div>
  );
}
