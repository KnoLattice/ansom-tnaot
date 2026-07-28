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
import { DocumentsSection } from "@/components/surfaces/home/DocumentsSection";
import { ChatFAB } from "@/components/surfaces/chat/ChatFAB";

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

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
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-3xl space-y-5"
      >
        <Skeleton className="h-16 rounded-[var(--radius-card)]" />
        <Skeleton className="h-52 rounded-[var(--radius-card)]" />
        <Skeleton className="h-14 rounded-[var(--radius-button)]" />
        <Skeleton className="h-40 rounded-[var(--radius-card)]" />
      </motion.div>
    );
  }

  // ── Empty state: no documents ──
  if (!hasDocuments) {
    return (
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-3xl space-y-6"
      >
        <motion.div variants={fadeUp}>
          <ContinuityBanner
            lastSession={null}
            isFirstVisit
            learnerName={learner?.fullName?.split(" ")[0]}
          />
        </motion.div>
        <motion.div variants={fadeUp} className="flex min-h-[40vh] flex-col items-center justify-center text-center">
          <div className="kl-glass-panel px-12 py-16 max-w-lg">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent-primary)]/10">
              <Upload className="h-6 w-6 text-[var(--color-accent-primary)]" />
            </div>
            <h2 className="mt-5 font-display text-xl font-bold text-[var(--color-text-primary)]">
              No documents loaded
            </h2>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Upload a PDF to extract concepts and build your knowledge graph. Processing takes approximately 60 seconds.
            </p>
            <Button className="mt-6" onClick={() => router.push("/upload")}>
              Upload Document
            </Button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // ── Main home ──
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-3xl space-y-6"
    >
      {/* 1. Continuity banner */}
      <motion.div variants={fadeUp}>
        <ContinuityBanner
          lastSession={lastSession}
          isFirstVisit={!lastSession && documents.length <= 1}
          learnerName={learner?.fullName?.split(" ")[0]}
        />
      </motion.div>

      {/* 2. Pulse — mastery overview */}
      {hasReadyDoc && dashboard && (
        <motion.div variants={fadeUp}>
          <PulseCard
            overallMasteryPercent={dashboard.overallMasteryPercent}
            sparklineData={sparklineData}
          />
        </motion.div>
      )}

      {/* 3. Primary action */}
      {hasReadyDoc && activeDocumentId && (
        <motion.div variants={fadeUp}>
          <PrimaryAction
            documentId={activeDocumentId}
            onStartSession={handleStartSession}
            onChooseStudy={handleChooseStudy}
          />
        </motion.div>
      )}

      {/* Not-ready state: document is processing */}
      {activeDocument && activeDocument.processingStatus !== "completed" && (
        <motion.div variants={fadeUp} className="kl-card">
          <div className="flex items-center gap-3">
            <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-[var(--color-accent-primary)]" />
            <p className="font-medium text-[var(--color-text-primary)]">
              Processing
            </p>
          </div>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Document is being analyzed. This usually takes about a minute.{" "}
            <button
              type="button"
              className="font-medium text-[var(--color-accent-primary)] hover:underline"
              onClick={() => router.push("/library")}
            >
              View in Library
            </button>
          </p>
        </motion.div>
      )}

      {lastSession && (
        <motion.div variants={fadeUp}>
          <LastSessionSummary lastSession={lastSession} />
        </motion.div>
      )}

      <motion.div variants={fadeUp}>
        <DocumentsSection
          documents={documents}
          activeDocumentId={activeDocumentId}
        />
      </motion.div>

      <ChatFAB />
    </motion.div>
  );
}
