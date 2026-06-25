"use client";

import { motion } from "framer-motion";
import { Waves, Zap, Clock } from "lucide-react";
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
  let icon: React.ReactNode;

  if (isFirstVisit) {
    icon = <Zap className="h-4 w-4 text-[var(--color-accent-secondary)]" />;
    message = learnerName
      ? `Welcome, ${learnerName}! Upload a document to start your learning journey.`
      : "Welcome! Upload a document to start your learning journey.";
  } else if (lastSession) {
    const timeAgo = fromNow(lastSession.endedAt ?? lastSession.startedAt);
    const accuracy = lastSession.accuracyPercent;
    const questions = lastSession.totalInteractions;
    icon = <Clock className="h-4 w-4 text-[var(--color-accent-primary)]" />;
    message = `Last session ${timeAgo} — ${questions} question${questions !== 1 ? "s" : ""}${accuracy != null ? `, ${accuracy}% accuracy` : ""}.`;
  } else {
    icon = <Waves className="h-4 w-4 text-[var(--color-text-muted)]" />;
    message = "No recent sessions. Start one to continue learning.";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex items-center gap-3 rounded-xl bg-[var(--color-surface-elevated)] px-5 py-3.5"
    >
      {icon}
      <p className="text-sm text-[var(--color-text-secondary)]">{message}</p>
    </motion.div>
  );
}
