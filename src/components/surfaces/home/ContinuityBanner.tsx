"use client";

import { motion } from "framer-motion";
import type { SessionHistoryEntry } from "@/lib/types/api";
import { fromNow } from "@/lib/utils/format";

interface ContinuityBannerProps {
  lastSession: SessionHistoryEntry | null;
  isFirstVisit: boolean;
  learnerName?: string;
}

export function ContinuityBanner({
  lastSession,
  isFirstVisit,
  learnerName,
}: ContinuityBannerProps) {
  let message: string;
  let statusTag: string;
  let tagColor: string;

  if (isFirstVisit) {
    statusTag = "NEW";
    tagColor = "bg-[var(--color-accent-primary)] text-white";
    message = learnerName
      ? `Welcome, ${learnerName}! Upload a document to start your first study session.`
      : "Welcome! Upload a document to start your first study session.";
  } else if (lastSession) {
    const timeAgo = fromNow(lastSession.endedAt ?? lastSession.startedAt);
    const accuracy = lastSession.accuracyPercent;
    const questions = lastSession.totalInteractions;
    statusTag = "RETURNING";
    tagColor = "bg-[var(--color-accent-secondary)]/10 text-[var(--color-accent-secondary)]";
    message = `Last session ${timeAgo}: ${questions} interaction${questions !== 1 ? "s" : ""}${accuracy != null ? ` / ${accuracy}% accuracy` : ""}.`;
  } else {
    statusTag = "IDLE";
    tagColor = "bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]";
    message = "No recent sessions. Start one to continue learning.";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex items-start gap-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-5 py-4 shadow-sm"
    >
      <span className={`inline-block shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${tagColor}`}>
        {statusTag}
      </span>
      <p className="text-sm text-[var(--color-text-secondary)]">{message}</p>
    </motion.div>
  );
}
