"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import { useDocuments, useDashboard, useWeakNodes } from "@/lib/hooks";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { ContinuityBanner } from "@/components/surfaces/home/ContinuityBanner";
import { PulseCard } from "@/components/surfaces/home/PulseCard";
import { AttentionCard } from "@/components/surfaces/home/AttentionCard";
import { PrimaryAction } from "@/components/surfaces/home/PrimaryAction";
import { LastSessionSummary } from "@/components/surfaces/home/LastSessionSummary";
import { LibraryStrip } from "@/components/surfaces/home/LibraryStrip";
import type { NodeStudied } from "@/lib/types/api";
import Cookies from 'js-cookie';

export default function HomePage() {
  const router = useRouter();
  const learner = useAuthStore((s) => s.learner);
  const { documents, activeDocument, activeDocumentId, isLoading: docsLoading } = useDocuments();

  const { data: dashboard, isLoading: dashLoading } = useDashboard(activeDocumentId ?? null);
  const { data: weakNodesData } = useWeakNodes(activeDocumentId ?? null);

  const hasDocuments = documents.length > 0;
  const hasReadyDoc = activeDocument?.processingStatus === "completed";

  // Get last session from dashboard history
  const lastSession = useMemo(() => {
    if (!dashboard?.sessionHistory?.length) return null;
    return dashboard.sessionHistory[0];
  }, [dashboard]);

  // Try to load last session's node data from sessionStorage
  const lastSessionCache = useMemo(() => {
    if (!lastSession || typeof window === "undefined") {
      return { nodesStudied: [] as NodeStudied[], nodeTitles: {} as Record<string, string> };
    }
    try {
      const summaryRaw = Cookies.get(`session_summary_${lastSession.sessionId}`);
      const titlesRaw = Cookies.get(`session_titles_${lastSession.sessionId}`);
      const nodesStudied: NodeStudied[] = summaryRaw
        ? (JSON.parse(summaryRaw) as { nodesStudied?: NodeStudied[] }).nodesStudied ?? []
        : [];
      const nodeTitles: Record<string, string> = titlesRaw ? JSON.parse(titlesRaw) : {};
      return { nodesStudied, nodeTitles };
    } catch {
      return { nodesStudied: [] as NodeStudied[], nodeTitles: {} as Record<string, string> };
    }
  }, [lastSession]);

  // Build sparkline data from session history (approximate: use accuracy as proxy)
  // TODO: Backend needs a GET /me/overview endpoint with 14-day sparkline data
  const sparklineData = useMemo(() => {
    if (!dashboard) return [];
    // Use overall mastery as a single-point; no historical sparkline from this endpoint
    return [dashboard.overallMasteryPercent / 100];
  }, [dashboard]);

  const weakNodes = weakNodesData?.weakNodes ?? [];

  const handleStartSession = () => {
    if (activeDocumentId) {
      router.push(`/session/new?documentId=${activeDocumentId}`);
    }
  };

  const handleChooseStudy = () => {
    if (activeDocumentId) {
      router.push(`/mastery/${activeDocumentId}`);
    }
  };

  const handleStudyNodes = () => {
    // Start a session — the backend picks concepts, but we navigate to session
    if (activeDocumentId) {
      router.push(`/session/new?documentId=${activeDocumentId}`);
    }
  };

  // ── Empty state: no documents ──
  if (!docsLoading && !hasDocuments) {
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <ContinuityBanner
          lastSession={null}
          isFirstVisit
          learnerName={learner?.fullName?.split(" ")[0]}
        />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex min-h-[40vh] flex-col items-center justify-center text-center"
        >
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-12">
            <Upload className="mx-auto h-10 w-10 text-text-muted" />
            <h2 className="mt-4 font-display text-xl font-bold text-white">
              Upload your first document
            </h2>
            <p className="mt-2 max-w-sm text-sm text-text-secondary">
              Upload a PDF, and we&apos;ll build a knowledge graph you can study
              from. It takes about a minute.
            </p>
            <Button className="mt-6" onClick={() => router.push("/upload")}>
              Upload a document
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Loading skeleton ──
  if (docsLoading || (hasReadyDoc && dashLoading)) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Banner skeleton */}
        <div className="h-10 animate-pulse rounded-xl bg-white/5" />
        {/* Cards skeleton */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-48 animate-pulse rounded-2xl bg-white/5" />
          <div className="h-48 animate-pulse rounded-2xl bg-white/5" />
        </div>
        {/* Action skeleton */}
        <div className="h-14 animate-pulse rounded-md bg-white/5" />
      </div>
    );
  }

  // ── Main home ──
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* 1. Continuity banner */}
      <ContinuityBanner
        lastSession={lastSession}
        isFirstVisit={!lastSession && documents.length <= 1}
        learnerName={learner?.fullName?.split(" ")[0]}
      />

      {/* 2 & 3. Pulse + Attention cards */}
      {hasReadyDoc && dashboard && (
        <div className="grid gap-6 md:grid-cols-2">
          <PulseCard
            overallMasteryPercent={dashboard.overallMasteryPercent}
            sparklineData={sparklineData}
          />
          <AttentionCard weakNodes={weakNodes} onStudy={handleStudyNodes} />
        </div>
      )}

      {/* 4. Primary action */}
      {hasReadyDoc && activeDocumentId && (
        <PrimaryAction
          documentId={activeDocumentId}
          onStartSession={handleStartSession}
          onChooseStudy={handleChooseStudy}
        />
      )}

      {/* Not-ready state: document is processing */}
      {activeDocument && activeDocument.processingStatus !== "completed" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-white/8 bg-white/[0.03] p-8 text-center"
        >
          <p className="text-sm font-medium text-white">
            Your document is still processing
          </p>
          <p className="mt-1 text-xs text-text-muted">
            This usually takes about a minute. You can check progress in the{" "}
            <button
              type="button"
              className="text-accent-primary underline underline-offset-4"
              onClick={() => router.push("/library")}
            >
              Library
            </button>
            .
          </p>
        </motion.div>
      )}

      {/* 5. Last session summary (below the fold) */}
      {lastSession && lastSessionCache.nodesStudied.length > 0 && (
        <LastSessionSummary
          lastSession={lastSession}
          nodesStudied={lastSessionCache.nodesStudied}
          nodeTitles={lastSessionCache.nodeTitles}
        />
      )}

      {/* 6. Library access strip */}
      <LibraryStrip activeDocumentName={activeDocument?.originalName ?? null} />
    </div>
  );
}
