"use client";

import { motion } from "framer-motion";
import { Sparkles, BookOpen, Zap } from "lucide-react";
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
  let Icon: React.ElementType;

  if (isFirstVisit) {
    statusTag = "Welcome";
    Icon = Sparkles;
    message = learnerName
      ? `Welcome, ${learnerName}. Upload a document to start your first study session.`
      : "Welcome. Upload a document to start your first study session.";
  } else if (lastSession) {
    const timeAgo = fromNow(lastSession.endedAt ?? lastSession.startedAt);
    const accuracy = lastSession.accuracyPercent;
    const questions = lastSession.totalInteractions;
    statusTag = "Returning";
    Icon = Zap;
    message = `Last session ${timeAgo}: ${questions} interaction${questions !== 1 ? "s" : ""}${accuracy != null ? ` / ${accuracy}% accuracy` : ""}.`;
  } else {
    statusTag = "Ready";
    Icon = BookOpen;
    message = "No recent sessions. Start one to continue learning.";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="kl-glass-panel flex items-center gap-4 px-5 py-4"
    >
      {/* Status chip with icon */}
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--color-accent-primary)]/12 px-3 py-1.5 text-xs font-semibold text-[var(--color-accent-primary)]">
        <Icon className="h-3.5 w-3.5" />
        {statusTag}
      </span>
      <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
        {message}
      </p>
    </motion.div>
  );
}
