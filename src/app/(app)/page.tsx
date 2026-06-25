"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
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

  // Loading skeleton
  if (docsLoading || (hasReadyDoc && dashLoading)) {
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <Skeleton className="h-12 rounded-xl" />
        <div className="grid gap-5 md:grid-cols-2">
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-56 rounded-2xl" />
        </div>
        <Skeleton className="h-14 rounded-xl" />
      </div>
    );
  }

  // Empty state: no documents
  if (!hasDocuments) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <ContinuityBanner
          lastSession={null}
          isFirstVisit
          learnerName={learner?.fullName?.split(" ")[0]}
        />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex min-h-[40vh] flex-col items-center justify-center text-center"
        >
          <div className="rounded-2xl border-2 border-dashed border-[var(--color-border-default)] bg-[var(--color-surface)] p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-accent-primary)]/10">
              <Upload className="h-6 w-6 text-[var(--color-accent-primary)]" />
            </div>
            <h2 className="mt-5 font-display text-2xl text-[var(--color-text-primary)]">
              No documents yet
            </h2>
            <p className="mt-2 max-w-sm text-sm text-[var(--color-text-secondary)]">
              Upload a PDF to extract concepts and build your personal knowledge map.
              Processing takes about a minute.
            </p>
            <Button
              className="mt-6 rounded-xl bg-[var(--color-accent-primary)] px-6 py-3 text-white shadow-soft hover:opacity-90 transition-opacity"
              onClick={() => router.push("/upload")}
            >
              Upload your first document
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main home
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* 1. Continuity banner */}
      <ContinuityBanner
        lastSession={lastSession}
        isFirstVisit={!lastSession && documents.length <= 1}
        learnerName={learner?.fullName?.split(" ")[0]}
      />

      {/* 2 & 3. Pulse + Attention cards */}
      {hasReadyDoc && dashboard && (
        <div className="grid gap-5 md:grid-cols-2">
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
          transition={{ duration: 0.3 }}
          className="flex items-center gap-4 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5 shadow-soft-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
            <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-amber-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              Processing your document
            </p>
            <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
              This usually takes about a minute.{" "}
              <button
                type="button"
                className="font-semibold text-[var(--color-accent-primary)]"
                onClick={() => router.push("/library")}
              >
                View in Library
              </button>
            </p>
          </div>
        </motion.div>
      )}

      {/* Last session recap */}
      {lastSession && lastSessionCache.nodesStudied.length > 0 && (
        <LastSessionSummary
          lastSession={lastSession}
          nodesStudied={lastSessionCache.nodesStudied}
          nodeTitles={lastSessionCache.nodeTitles}
        />
      )}

      {/* Bottom section: Library + Upload + Recent */}
      <div className="space-y-4 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5 shadow-soft-sm">
        <LibraryStrip activeDocumentName={activeDocument?.originalName ?? null} />
        <QuickUploadZone showFullUploadCTA={false} />
        <RecentDocuments documents={documents} />
      </div>
    </div>
  );
}
