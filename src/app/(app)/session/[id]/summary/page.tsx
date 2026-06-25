"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Play, Home, Trophy, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/Spinner";
import { HeadlineMoment } from "@/components/surfaces/session/HeadlineMoment";
import { MovementMap } from "@/components/surfaces/session/MovementMap";
import type { EndSessionResponse } from "@/lib/types/api";
import Cookies from 'js-cookie';
import { MASTERY_CALLOUT_THRESHOLD, MASTERY_ANIMATION } from "@/lib/constants/mastery";

export default function SessionSummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [summary] = useState<EndSessionResponse | null>(() => {
    if (typeof window === "undefined") return null;
    const cached = Cookies.get(`session_summary_${id}`);
    if (!cached) return null;
    try {
      return JSON.parse(cached) as EndSessionResponse;
    } catch {
      return null;
    }
  });

  const [nodeTitles] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    const titles = Cookies.get(`session_titles_${id}`);
    if (!titles) return {};
    try {
      return JSON.parse(titles) as Record<string, string>;
    } catch {
      return {};
    }
  });

  if (!summary) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <Spinner />
        <p className="text-sm text-[var(--color-text-muted)]">
          Loading summary...
        </p>
        <button
          type="button"
          className="text-sm font-semibold text-[var(--color-accent-primary)]"
          onClick={() => router.push("/")}
        >
          Back to home
        </button>
      </div>
    );
  }

  const { nodesStudied } = summary;

  const thresholdCrossings = nodesStudied.filter(
    (n) =>
      n.masteryBefore < MASTERY_CALLOUT_THRESHOLD &&
      n.masteryAfter >= MASTERY_CALLOUT_THRESHOLD,
  );

  const stillWeak = nodesStudied.filter((n) => n.masteryAfter < 0.4);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      {/* Headline moment */}
      <HeadlineMoment summary={summary} nodeTitles={nodeTitles} />

      {/* Movement map */}
      {nodesStudied.length > 0 && (
        <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5 shadow-soft-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            Concept Progress
          </p>
          <MovementMap nodes={nodesStudied} nodeTitles={nodeTitles} />
        </div>
      )}

      {/* Threshold crossings */}
      {thresholdCrossings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: nodesStudied.length * MASTERY_ANIMATION.listStagger + 0.2, duration: 0.3 }}
          className="space-y-2"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            Milestones
          </p>
          <div className="space-y-2">
            {thresholdCrossings.map((node) => (
              <div
                key={node.nodeId}
                className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3"
              >
                <Trophy className="h-4 w-4 shrink-0 text-emerald-600" />
                <span className="text-sm text-emerald-800">
                  Mastered:{" "}
                  <span className="font-semibold">
                    {nodeTitles[node.nodeId] ?? node.nodeId.slice(0, 8)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Still weak */}
      {stillWeak.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: nodesStudied.length * MASTERY_ANIMATION.listStagger + 0.4, duration: 0.3 }}
          className="space-y-2"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            Keep working on
          </p>
          <div className="space-y-2">
            {stillWeak.map((node) => (
              <div
                key={node.nodeId}
                className="flex items-center justify-between rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                  <span className="text-sm text-[var(--color-text-primary)]">
                    {nodeTitles[node.nodeId] ?? node.nodeId.slice(0, 8)}
                  </span>
                </div>
                <span className="font-mono text-sm font-semibold tabular-nums text-[var(--color-text-muted)]">
                  {Math.round(node.masteryAfter * 100)}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Next actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: nodesStudied.length * MASTERY_ANIMATION.listStagger + 0.6 }}
        className="flex flex-col gap-3 pt-4 sm:flex-row"
      >
        <Button
          className="flex-1 h-12 rounded-xl bg-[var(--color-accent-primary)] text-white font-semibold hover:opacity-90 transition-opacity"
          onClick={() => {
            const docId = Cookies.get(`session_docId_${id}`);
            if (docId) {
              router.push(`/session/new?documentId=${docId}`);
            } else {
              router.push("/");
            }
          }}
        >
          <Play className="mr-2 h-4 w-4" />
          Study again
        </Button>
        <Button
          variant="outline"
          className="flex-1 h-12 rounded-xl border-[var(--color-border-default)] font-medium hover:bg-[var(--color-surface-elevated)]"
          onClick={() => router.push("/")}
        >
          <Home className="mr-2 h-4 w-4" />
          Done for now
        </Button>
      </motion.div>
    </div>
  );
}
