"use client";

import { motion } from "framer-motion";
import { Trophy, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react";
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
): { text: string; icon: React.ReactNode } {
  const { nodesStudied } = summary;
  if (nodesStudied.length === 0) {
    return { text: "Session complete", icon: <CheckCircle2 className="h-6 w-6" /> };
  }

  const mastered = nodesStudied.filter(
    (n) =>
      n.masteryBefore < MASTERY_CALLOUT_THRESHOLD &&
      n.masteryAfter >= MASTERY_CALLOUT_THRESHOLD,
  );
  if (mastered.length > 0) {
    const name = nodeTitles[mastered[0].nodeId] ?? "a concept";
    return {
      text: mastered.length === 1 ? `You mastered ${name}` : `You mastered ${mastered.length} concepts`,
      icon: <Trophy className="h-6 w-6 text-amber-500" />,
    };
  }

  const sorted = [...nodesStudied].sort(
    (a, b) => Math.abs(b.delta) - Math.abs(a.delta),
  );
  const biggest = sorted[0];
  if (biggest && biggest.delta > 0) {
    const name = nodeTitles[biggest.nodeId] ?? "a concept";
    const delta = `+${Math.round(biggest.delta * 100)}%`;
    return {
      text: `Biggest gain: ${name} (${delta})`,
      icon: <TrendingUp className="h-6 w-6 text-emerald-500" />,
    };
  }

  if (nodesStudied.every((n) => n.delta >= 0)) {
    return {
      text: "Every concept improved",
      icon: <Sparkles className="h-6 w-6 text-[var(--color-accent-primary)]" />,
    };
  }

  return { text: "Session complete", icon: <CheckCircle2 className="h-6 w-6" /> };
}

export function HeadlineMoment({ summary, nodeTitles }: HeadlineMomentProps) {
  const { text, icon } = pickHeadline(summary, nodeTitles);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="pb-6 text-center"
    >
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-surface-elevated)]">
        {icon}
      </div>
      <h1 className="font-display text-3xl text-[var(--color-text-primary)]">
        {text}
      </h1>
      <p className="mt-3 text-sm text-[var(--color-text-muted)]">
        {summary.totalInteractions} question{summary.totalInteractions !== 1 ? "s" : ""} &middot;{" "}
        {summary.accuracy}% accuracy &middot;{" "}
        {formatDuration(summary.durationMs)}
      </p>
    </motion.div>
  );
}
