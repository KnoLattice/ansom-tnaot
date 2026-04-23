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

  if (isFirstVisit) {
    message = learnerName
      ? `Welcome, ${learnerName}! Upload a document and start your first session.`
      : "Welcome! Upload a document and start your first session.";
  } else if (lastSession) {
    const timeAgo = fromNow(lastSession.endedAt ?? lastSession.startedAt);
    const accuracy = lastSession.accuracyPercent;
    const questions = lastSession.totalInteractions;
    message = `Welcome back. Last session ${timeAgo}: ${questions} question${questions !== 1 ? "s" : ""}${accuracy != null ? `, ${accuracy}% accuracy` : ""}.`;
  } else {
    message = "Welcome back. Start a session to continue learning.";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-2.5"
    >
      <p className="text-sm text-text-secondary">{message}</p>
    </motion.div>
  );
}
