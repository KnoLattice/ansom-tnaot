"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Upload, CloudUpload } from "lucide-react";
import { useDocuments, useDashboard, useWeakNodes } from "@/lib/hooks";
import { useAuthStore } from "@/store/auth.store";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ContinuityBanner } from "@/components/surfaces/home/ContinuityBanner";
import { PulseCard } from "@/components/surfaces/home/PulseCard";
import { AttentionCard } from "@/components/surfaces/home/AttentionCard";
import { PrimaryAction } from "@/components/surfaces/home/PrimaryAction";
import { LastSessionSummary } from "@/components/surfaces/home/LastSessionSummary";
import { LibraryStrip } from "@/components/surfaces/home/LibraryStrip";
import type { NodeStudied } from "@/lib/types/api";
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
      const summaryRaw = localStorage.getItem(`session_summary_${lastSession.sessionId}`);
      const titlesRaw = localStorage.getItem(`session_titles_${lastSession.sessionId}`);
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

  // ── Loading skeleton ──
  if (docsLoading || (hasReadyDoc && dashLoading)) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-10" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-14" />
      </div>
    );
  }

  // ── Empty state: no documents ──
  if (!hasDocuments) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <ContinuityBanner
          lastSession={null}
          isFirstVisit
          learnerName={learner?.fullName?.split(" ")[0]}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="flex min-h-[40vh] flex-col items-center justify-center text-center"
        >
          <div className="border-2 border rounded-md border-dashed border-[var(--color-border-default)] bg-[var(--color-surface)] p-12">
            <Upload className="mx-auto h-8 w-8 text-[var(--color-text-muted)]" />
            <h2 className="mt-4 font-mono text-lg font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
              No documents loaded
            </h2>
            <p className="mt-2 max-w-sm text-sm text-[var(--color-text-secondary)]">
              Upload a PDF to extract concepts and build your knowledge graph.
              Processing takes approximately 60 seconds.
            </p>
            <Button className="mt-6 border rounded-md" onClick={() => router.push("/upload")}>
              <CloudUpload className="mr-2 h-4 w-4" />
              UPLOAD DOCUMENT
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Main home ──
  return (
    <div className="mx-auto space-y-6">
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="border border-[var(--color-border-default)] bg-[var(--color-surface)] p-6"
        >
          <div className="flex items-center gap-3">
            <span className="inline-block h-2 w-2 animate-pulse bg-[var(--color-accent-primary)]" />
            <p className="font-mono text-sm font-medium text-[var(--color-text-primary)]">
              PROCESSING
            </p>
          </div>
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
            Document is being analyzed. This usually takes about a minute.{" "}
            <button
              type="button"
              className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-accent-primary)]"
              onClick={() => router.push("/library")}
            >
              VIEW IN LIBRARY
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

      <div className="flex flex-col gap-4 border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-4 py-2.5">
        <LibraryStrip activeDocumentName={activeDocument?.originalName ?? null} />
        <QuickUploadZone showFullUploadCTA={false} />
        <RecentDocuments documents={documents} />
      </div>
    </div>
  );
}
