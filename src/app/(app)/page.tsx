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
import { RecentDocuments } from "@/components/surfaces/home/RecentDocuments";
import { QuickUploadZone } from "@/components/surfaces/home/QuickUploadZone";

export default function HomePage() {
  const router = useRouter();
  const learner = useAuthStore((s) => s.learner);
  const { documents, activeDocument, activeDocumentId, isLoading: docsLoading } = useDocuments();

  const { data: dashboard, isLoading: dashLoading } = useDashboard(activeDocumentId ?? null);
  const { data: weakNodesData } = useWeakNodes(activeDocumentId ?? null);

  const hasDocuments = documents.length > 0;
  const hasReadyDoc = activeDocument?.processingStatus === "completed";

  const lastSession = useMemo(() => {
    if (!dashboard?.sessionHistory?.length) return null;
    return dashboard.sessionHistory[0];
  }, [dashboard]);

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

  const sparklineData = useMemo(() => {
    if (!dashboard) return [];
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
    if (activeDocumentId) {
      router.push(`/session/new?documentId=${activeDocumentId}`);
    }
  };

  // ── Empty state: no documents ──
  if (!docsLoading && !hasDocuments) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 font-poppins">
        <ContinuityBanner
          lastSession={null}
          isFirstVisit
          learnerName={learner?.fullName?.split(" ")[0]}
        />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex min-h-[40vh] flex-col items-center justify-center text-center"
        >
          <div className="rounded-2xl border-2 border-dashed border-[var(--color-border-default)] bg-[var(--color-surface)] p-12 shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent-primary)]/10">
              <Upload className="h-7 w-7 text-[var(--color-accent-primary)]" />
            </div>
            <h2 className="mt-5 text-lg font-semibold text-[var(--color-text-primary)]">
              No documents yet
            </h2>
            <p className="mt-2 max-w-sm text-sm text-[var(--color-text-secondary)]">
              Upload a PDF to extract concepts and build your knowledge graph.
              Processing takes approximately 60 seconds.
            </p>
            <Button className="mt-6 rounded-xl" onClick={() => router.push("/upload")}>
              Upload Document
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Loading skeleton ──
  if (docsLoading || (hasReadyDoc && dashLoading)) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 font-poppins">
        <div className="h-12 kl-shimmer" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-48 kl-shimmer" />
          <div className="h-48 kl-shimmer" />
        </div>
        <div className="h-14 kl-shimmer" />
      </div>
    );
  }

  // ── Main home ──
  return (
    <div className="mx-auto max-w-5xl space-y-4 font-poppins">
      {/* 1. Continuity banner */}
      <ContinuityBanner
        lastSession={lastSession}
        isFirstVisit={!lastSession && documents.length <= 1}
        learnerName={learner?.fullName?.split(" ")[0]}
      />

      {/* 2 & 3. Pulse + Attention — data grid */}
      {hasReadyDoc && dashboard && (
        <div className="grid gap-4 md:grid-cols-2">
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
          transition={{ duration: 0.35 }}
          className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-accent-primary)]" style={{ animation: "gentlePulse 1.5s ease-in-out infinite" }} />
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              Processing document...
            </p>
          </div>
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
            Document is being analyzed. This usually takes about a minute.{" "}
            <button
              type="button"
              className="font-semibold text-[var(--color-accent-primary)] hover:underline"
              onClick={() => router.push("/library")}
            >
              View in Library
            </button>
          </p>
        </motion.div>
      )}


      {lastSession && lastSessionCache.nodesStudied.length > 0 && (
        <LastSessionSummary
          lastSession={lastSession}
          nodesStudied={lastSessionCache.nodesStudied}
          nodeTitles={lastSessionCache.nodeTitles}
        />
      )}

      <div className="flex flex-col gap-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4 shadow-sm">
        <LibraryStrip activeDocumentName={activeDocument?.originalName ?? null} />
        <QuickUploadZone showFullUploadCTA={false} />
        <RecentDocuments documents={documents}/>
      </div>
    </div>
  );
}
