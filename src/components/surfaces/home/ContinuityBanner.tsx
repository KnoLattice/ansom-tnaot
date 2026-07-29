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

  if (isFirstVisit) {
    statusTag = "Welcome";
    message = learnerName
      ? `Welcome, ${learnerName}. Upload a document to start your first study session.`
      : "Welcome. Upload a document to start your first study session.";
  } else if (lastSession) {
    const timeAgo = fromNow(lastSession.endedAt ?? lastSession.startedAt);
    const accuracy = lastSession.accuracyPercent;
    const questions = lastSession.totalInteractions;
    statusTag = "Returning";
    message = `Last session ${timeAgo}: ${questions} interaction${questions !== 1 ? "s" : ""}${accuracy != null ? ` / ${accuracy}% accuracy` : ""}.`;
  } else {
    statusTag = "Ready";
    message = "No recent sessions. Start one to continue learning.";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="kl-glass-panel flex items-center gap-4 p-4"
    >
      <span className="inline-flex items-center rounded-[var(--radius-badge)] bg-[var(--color-accent-primary)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--color-accent-primary)]">
        {statusTag}
      </span>
      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{message}</p>
    </motion.div>
  );
}
