"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PlayCircle, Home } from "lucide-react";
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
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Spinner />
        <p className="mt-4 font-mono text-[10px] text-[var(--color-text-muted)]">LOADING SUMMARY...</p>
        <button
          type="button"
          className="mt-4 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent-primary)]"
          onClick={() => router.push("/")}
        >
          BACK TO HOME
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
        <MovementMap nodes={nodesStudied} nodeTitles={nodeTitles} />
      )}

      {/* Threshold crossings */}
      {thresholdCrossings.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: nodesStudied.length * MASTERY_ANIMATION.listStagger + 0.2 }}
          className="space-y-2"
        >
          <p className="kl-data-label">Threshold Crossings</p>
          <div className="space-y-1">
            {thresholdCrossings.map((node) => (
              <div
                key={node.nodeId}
                className="border-l-2 border-l-green-500 bg-green-500/5 px-4 py-3 text-sm text-green-400"
              >
                MASTERED:{" "}
                <span className="font-semibold">
                  {nodeTitles[node.nodeId] ?? node.nodeId.slice(0, 8)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Still weak */}
      {stillWeak.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: nodesStudied.length * MASTERY_ANIMATION.listStagger + 0.4 }}
          className="space-y-2"
        >
          <p className="kl-data-label">Keep Working On</p>
          <div className="space-y-1">
            {stillWeak.map((node) => (
              <div
                key={node.nodeId}
                className="border rounded-md border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text-secondary)]"
              >
                {nodeTitles[node.nodeId] ?? node.nodeId.slice(0, 8)} —{" "}
                <span className="font-mono font-bold tabular-nums">
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
          className="flex-1 rounded-md"
          onClick={() => {
            const docId = Cookies.get(`session_docId_${id}`);
            if (docId) {
              router.push(`/session/new?documentId=${docId}`);
            } else {
              router.push("/");
            }
          }}
        >
          <PlayCircle className="mr-2 h-4 w-4" />
          STUDY AGAIN
        </Button>
        <Button
          variant="outline"
          className="flex-1 hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-primary)]"
          onClick={() => router.push("/")}
        >
          <Home className="mr-2 h-4 w-4" />
          DONE
        </Button>
      </motion.div>
    </div>
  );
}
