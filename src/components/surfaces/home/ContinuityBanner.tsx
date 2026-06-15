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
    statusTag = "NEW";
    message = learnerName
      ? `Welcome, ${learnerName}. Upload a document to initialize your first study session.`
      : "Welcome. Upload a document to initialize your first study session.";
  } else if (lastSession) {
    const timeAgo = fromNow(lastSession.endedAt ?? lastSession.startedAt);
    const accuracy = lastSession.accuracyPercent;
    const questions = lastSession.totalInteractions;
    statusTag = "RETURNING";
    message = `Last session ${timeAgo}: ${questions} interaction${questions !== 1 ? "s" : ""}${accuracy != null ? ` / ${accuracy}% accuracy` : ""}.`;
  } else {
    statusTag = "IDLE";
    message = "No recent sessions. Start one to continue learning.";
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="flex items-start gap-3 border-l-2 border-[var(--color-accent-primary)] bg-[var(--color-surface)] px-4 py-3"
    >
      <span className="inline-block shrink-0 border border-[var(--color-accent-primary)] px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-[var(--color-accent-primary)]">
        {statusTag}
      </span>
      <p className="text-sm text-[var(--color-text-secondary)]">{message}</p>
    </motion.div>
  );
}
