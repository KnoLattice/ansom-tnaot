"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/Spinner";
import { SessionHeader } from "@/components/surfaces/session/SessionHeader";
import { QuestionCard } from "@/components/surfaces/session/QuestionCard";
import { ConceptTransition } from "@/components/surfaces/session/ConceptTransition";
import { QuestionTypeDialog } from "@/components/surfaces/session/QuestionTypeDialog";
import { ThresholdCallout } from "@/components/shared/ThresholdCallout";
import { apiClient } from "@/lib/api/client";
import { API_ROUTES } from "@/lib/api/routes";
import Cookies from 'js-cookie';
import type {
  EndSessionResponse,
  FeedbackResult,
  Question,
  QuestionType,
  RespondResponse,
  StartSessionResponse,
  TargetNode,
} from "@/lib/types/api";

const MAX_SESSION_QUESTIONS = 12;

interface SessionState {
  sessionId: string | null;
  documentId: string | null;
  questionType: QuestionType;
  currentNode: TargetNode | null;
  currentQuestion: Question | null;
  feedback: FeedbackResult | null;
  previousNodeId: string | null;
  questionCount: number;
  correctCount: number;
  previousMastery: number | undefined;
  isTransitioning: boolean;
}

const initialState: SessionState = {
  sessionId: null,
  documentId: null,
  questionType: "qcm",
  currentNode: null,
  currentQuestion: null,
  feedback: null,
  previousNodeId: null,
  questionCount: 0,
  correctCount: 0,
  previousMastery: undefined,
  isTransitioning: false,
};

function SessionContent({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const documentId = searchParams.get("documentId");
  const [state, setState] = useState<SessionState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const questionStartTime = useRef<number>(Date.now());
  const startedRef = useRef(false);
  const nodeTitles = useRef<Record<string, string>>({});

  const [showTypeDialog, setShowTypeDialog] = useState(true);
  const questionTypeRef = useRef<QuestionType>("qcm");

  const pendingNext = useRef<{
    node: TargetNode | null;
    question: Question | null;
  } | null>(null);

  const handleCloseTypeDialog = useCallback(() => {
    router.back();
    setShowTypeDialog(false);
  }, [router]);

  const startSession = useCallback(async () => {
    if (!documentId) return;
    setLoading(true);
    try {
      const { data } = await apiClient.get<StartSessionResponse>(
        API_ROUTES.SESSIONS.START,
        { params: { documentId, questionType: questionTypeRef.current } },
      );
      nodeTitles.current = { [data.targetNode.id]: data.targetNode.title };
      setState({
        sessionId: data.sessionId,
        documentId,
        questionType: data.questionType ?? questionTypeRef.current,
        currentNode: data.targetNode,
        currentQuestion: data.question,
        feedback: null,
        previousNodeId: null,
        questionCount: 0,
        correctCount: 0,
        previousMastery: undefined,
        isTransitioning: false,
      });
      questionStartTime.current = Date.now();
    } catch {
      toast.error("Unable to start session. Check if your document is ready.");
      router.replace(documentId ? `/mastery/${documentId}` : "/");
    } finally {
      setLoading(false);
    }
  }, [documentId, router]);

  useEffect(() => {
    if (!documentId) {
      router.replace("/");
    }
  }, [documentId, router]);

  const handleTypeSelect = useCallback(
    (type: QuestionType) => {
      questionTypeRef.current = type;
      setShowTypeDialog(false);
      if (!startedRef.current) {
        startedRef.current = true;
        startSession();
      }
    },
    [startSession],
  );

  const handleSubmit = useCallback(
    async (answer: string) => {
      if (!state.sessionId || !state.currentNode || !state.currentQuestion)
        return;
      setIsSubmitting(true);
      try {
        const { data } = await apiClient.post<RespondResponse>(
          API_ROUTES.SESSIONS.RESPOND,
          {
            sessionId: state.sessionId,
            nodeId: state.currentNode.id,
            questionId: state.currentQuestion.id,
            selectedAnswer: answer,
            responseTimeMs: Date.now() - questionStartTime.current,
            sessionQuestionType: state.questionType,
          },
        );

        if (data.nextNode) {
          nodeTitles.current[data.nextNode.id] = data.nextNode.title;
        }

        pendingNext.current = {
          node: data.nextNode,
          question: data.question,
        };

        setState((prev) => ({
          ...prev,
          feedback: data.feedback,
          previousMastery: data.feedback.masteryBefore,
          questionCount: prev.questionCount + 1,
          correctCount: prev.correctCount + (data.feedback.isCorrect ? 1 : 0),
        }));

        if (data.sessionComplete) {
          pendingNext.current = { node: null, question: null };
        }
      } catch {
        toast.error("Could not submit answer. Please retry.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [state.sessionId, state.currentNode, state.currentQuestion],
  );

  const handleEndSession = useCallback(async () => {
    if (!state.sessionId) return;
    setIsSubmitting(true);
    try {
      const { data } = await apiClient.post<EndSessionResponse>(
        API_ROUTES.SESSIONS.END,
        { sessionId: state.sessionId },
      );
      if (typeof window !== "undefined") {
        Cookies.set(`session_summary_${state.sessionId}`, JSON.stringify(data));
        Cookies.set(`session_titles_${state.sessionId}`, JSON.stringify(nodeTitles.current));
        Cookies.set(`session_docId_${state.sessionId}`, state.documentId ?? "");
      }
      router.replace(`/session/${state.sessionId}/summary`);
    } catch {
      toast.error("Unable to end session. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [state.sessionId, state.documentId, router]);

  const handleContinue = useCallback(() => {
    const next = pendingNext.current;
    if (!next) return;

    if (!next.question) {
      handleEndSession();
      return;
    }

    const switchingConcepts =
      next.node && state.currentNode && next.node.id !== state.currentNode.id;

    if (switchingConcepts && next.node) {
      setState((prev) => ({
        ...prev,
        feedback: null,
        previousNodeId: prev.currentNode?.id ?? null,
        currentNode: next.node!,
        isTransitioning: true,
      }));
    } else {
      setState((prev) => ({
        ...prev,
        currentQuestion: next.question,
        feedback: null,
        previousMastery: undefined,
        isTransitioning: false,
      }));
      questionStartTime.current = Date.now();
      pendingNext.current = null;
    }
  }, [state.currentNode, handleEndSession]);

  const handleTransitionComplete = useCallback(() => {
    const next = pendingNext.current;
    setState((prev) => ({
      ...prev,
      currentQuestion: next?.question ?? prev.currentQuestion,
      feedback: null,
      previousMastery: undefined,
      isTransitioning: false,
    }));
    questionStartTime.current = Date.now();
    pendingNext.current = null;
  }, []);

  if (!documentId) {
    return null;
  }

  if (showTypeDialog) {
    return (
      <QuestionTypeDialog open={showTypeDialog} onSelect={handleTypeSelect} onClose={handleCloseTypeDialog} />
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!state.currentNode) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="font-mono text-xs text-[var(--color-text-muted)]">NO SESSION DATA</p>
      </div>
    );
  }

  const currentMastery = state.feedback
    ? state.feedback.masteryAfter
    : state.currentNode.masteryScore;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <SessionHeader
        conceptName={state.currentNode.title}
        masteryScore={currentMastery}
        previousMasteryScore={state.previousMastery}
        currentQuestion={state.questionCount + 1}
        totalQuestions={MAX_SESSION_QUESTIONS}
        correctCount={state.correctCount}
        isSubmitting={isSubmitting}
        onEndSession={handleEndSession}
      />

      {state.feedback && (
        <ThresholdCallout
          previousScore={state.feedback.masteryBefore}
          currentScore={state.feedback.masteryAfter}
          title={state.currentNode.title}
        />
      )}

      {state.isTransitioning ? (
        <ConceptTransition
          conceptName={state.currentNode.title}
          masteryScore={state.currentNode.masteryScore}
          onComplete={handleTransitionComplete}
        />
      ) : state.currentQuestion ? (
        <QuestionCard
          key={state.currentQuestion.id}
          question={state.currentQuestion}
          feedback={state.feedback}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onContinue={handleContinue}
        />
      ) : (
        <div className="border border-[var(--color-border-default)] bg-[var(--color-surface)] p-8 text-center">
          <p className="font-mono text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
            SESSION COMPLETE
          </p>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Great work. View your session summary to see how you did.
          </p>
          <button
            type="button"
            className="mt-4 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent-primary)]"
            onClick={handleEndSession}
            disabled={isSubmitting}
          >
            VIEW SUMMARY
          </button>
        </div>
      )}
    </div>
  );
}

export default function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <SessionContent id={id} />
    </Suspense>
  );
}
