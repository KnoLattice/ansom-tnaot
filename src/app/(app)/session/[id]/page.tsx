"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/Spinner";
import { SessionHeader } from "@/components/surfaces/session/SessionHeader";
import { QuestionCard } from "@/components/surfaces/session/QuestionCard";
import { ConceptTransition } from "@/components/surfaces/session/ConceptTransition";
import { ThresholdCallout } from "@/components/shared/ThresholdCallout";
import { apiClient } from "@/lib/api/client";
import { API_ROUTES } from "@/lib/api/routes";
import { useSessionStore } from "@/store/session.store";
import Cookies from "js-cookie";
import type {
  EndSessionResponse,
  FeedbackResult,
  Question,
  QuestionType,
  RespondResponse,
  StartSessionResponse,
  TargetNode,
} from "@/lib/types/api";

const MAX_SESSION_QUESTIONS = 15;

const ALL_QUESTION_TYPES: QuestionType[] = [
  "qcm",
  "short_answer",
  "fill_blank",
  "true_false",
  "matching",
];

/** Generate a shuffled sequence of 15 question types (3 of each format). */
function generateTypeSequence(): QuestionType[] {
  const sequence = ALL_QUESTION_TYPES.flatMap((t) => [t, t, t]);
  for (let i = sequence.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
  }
  return sequence;
}

interface RetryEntry {
  question: Question;
  node: TargetNode;
  attemptsUsed: number;
  slotIndex: number;
}

interface SessionState {
  sessionId: string | null;
  documentId: string | null;
  questionType: QuestionType;
  focusMode: boolean;
  currentNode: TargetNode | null;
  currentQuestion: Question | null;
  feedback: FeedbackResult | null;
  previousNodeId: string | null;
  questionCount: number;
  correctCount: number;
  resolvedCount: number;
  resolvedCorrectCount: number;
  previousMastery: number | undefined;
  isTransitioning: boolean;
  questionKey: number;
}

const initialState: SessionState = {
  sessionId: null,
  documentId: null,
  questionType: "qcm",
  focusMode: false,
  currentNode: null,
  currentQuestion: null,
  feedback: null,
  previousNodeId: null,
  questionCount: 0,
  correctCount: 0,
  resolvedCount: 0,
  resolvedCorrectCount: 0,
  previousMastery: undefined,
  isTransitioning: false,
  questionKey: 0,
};

function SessionContent({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const documentId = searchParams.get("documentId");
  const collectionId = searchParams.get("collectionId");
  const nodeId = searchParams.get("nodeId");
  const [state, setState] = useState<SessionState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const questionStartTime = useRef<number>(Date.now());
  const startedRef = useRef(false);
  const nodeTitles = useRef<Record<string, string>>({});

  const setSessionActive = useSessionStore((s) => s.startSession);
  const clearSession = useSessionStore((s) => s.endSession);

  // Mixed-type session tracking (normal mode)
  const typeSequence = useRef<QuestionType[]>(generateTypeSequence());
  const nextNewSlot = useRef(1); // slot 0 is served by startSession
  const currentSlotIndex = useRef(0);
  const retryQueue = useRef<RetryEntry[]>([]);
  const currentRetry = useRef<RetryEntry | null>(null);
  const resolvedSlots = useRef<Set<number>>(new Set());

  // Prevents retries from appearing back-to-back
  const lastWasRetry = useRef(false);

  // Buffered next question from backend (consumed when showing a new question)
  const bufferedNext = useRef<{
    node: TargetNode | null;
    question: Question | null;
  } | null>(null);

  // Used only for concept transition animations
  const pendingNext = useRef<{
    node: TargetNode | null;
    question: Question | null;
  } | null>(null);

  const startSession = useCallback(async () => {
    if (!documentId && !collectionId) return;
    setLoading(true);
    try {
      const firstType = typeSequence.current[0];
      const { data } = await apiClient.get<StartSessionResponse>(
        API_ROUTES.SESSIONS.START,
        {
          params: {
            ...(documentId && { documentId }),
            ...(collectionId && { collectionId }),
            questionType: firstType,
            ...(nodeId && { nodeId }),
          },
          timeout: nodeId ? 60000 : undefined,
        },
      );
      nodeTitles.current = { [data.targetNode.id]: data.targetNode.title };

      // Reset mixed-session refs
      nextNewSlot.current = 1;
      currentSlotIndex.current = 0;
      retryQueue.current = [];
      currentRetry.current = null;
      resolvedSlots.current = new Set();
      lastWasRetry.current = false;
      bufferedNext.current = null;
      pendingNext.current = null;

      setState({
        sessionId: data.sessionId,
        documentId,
        questionType: data.questionType ?? firstType,
        focusMode: data.focusMode ?? false,
        currentNode: data.targetNode,
        currentQuestion: data.question,
        feedback: null,
        previousNodeId: null,
        questionCount: 0,
        correctCount: 0,
        resolvedCount: 0,
        resolvedCorrectCount: 0,
        previousMastery: undefined,
        isTransitioning: false,
        questionKey: 0,
      });
      questionStartTime.current = Date.now();
      setSessionActive(data.sessionId, documentId ?? collectionId ?? "");
    } catch {
      toast.error("Unable to start session. Check if your document is ready.");
      router.replace(documentId ? `/mastery/${documentId}` : "/");
    } finally {
      setLoading(false);
    }
  }, [documentId, nodeId, router, setSessionActive]);

  // Auto-start session on mount (no type-selection dialog)
  useEffect(() => {
    if ((documentId || collectionId) && !startedRef.current) {
      startedRef.current = true;
      startSession();
    }
  }, [documentId, collectionId, startSession]);

  useEffect(() => {
    return () => {
      clearSession();
    };
  }, [clearSession]);

  useEffect(() => {
    if (!documentId) {
      router.replace("/");
    }
  }, [documentId, router]);

  const handleSubmit = useCallback(
    async (answer: string, matchingAnswer?: Record<string, string>) => {
      if (!state.sessionId || !state.currentNode || !state.currentQuestion)
        return;
      setIsSubmitting(true);
      try {
        // Request the next planned type for the backend to generate
        const desiredNextType =
          nextNewSlot.current < MAX_SESSION_QUESTIONS
            ? typeSequence.current[nextNewSlot.current]
            : state.currentQuestion.questionType;

        const payload: Record<string, unknown> = {
          sessionId: state.sessionId,
          nodeId: state.currentNode.id,
          questionId: state.currentQuestion.id,
          selectedAnswer: answer,
          responseTimeMs: Date.now() - questionStartTime.current,
          sessionQuestionType: desiredNextType,
        };
        if (matchingAnswer) {
          payload.matchingAnswer = matchingAnswer;
        }
        const { data } = await apiClient.post<RespondResponse>(
          API_ROUTES.SESSIONS.RESPOND,
          payload,
        );

        if (data.nextNode) {
          nodeTitles.current[data.nextNode.id] = data.nextNode.title;
        }

        // ── Mixed-type with retry queue (both normal & focused) ──
        const isRetry = currentRetry.current !== null;
        let resolvedViaCorrect = false;

        if (data.feedback.isCorrect) {
          resolvedSlots.current.add(currentSlotIndex.current);
          resolvedViaCorrect = true;
          currentRetry.current = null;
        } else if (isRetry) {
          const retry = currentRetry.current!;
          const newAttempts = retry.attemptsUsed + 1;
          if (
            newAttempts >= 2 ||
            resolvedSlots.current.has(retry.slotIndex)
          ) {
            // Exhausted all attempts or already resolved — done
            resolvedSlots.current.add(retry.slotIndex);
          } else {
            // Re-insert into retry queue at a random position
            const insertAt = Math.floor(
              Math.random() * (retryQueue.current.length + 1),
            );
            retryQueue.current.splice(insertAt, 0, {
              ...retry,
              attemptsUsed: newAttempts,
            });
          }
          currentRetry.current = null;
        } else if (!resolvedSlots.current.has(currentSlotIndex.current)) {
          // First attempt wrong — add to retry queue
          retryQueue.current.push({
            question: state.currentQuestion,
            node: state.currentNode,
            attemptsUsed: 1,
            slotIndex: currentSlotIndex.current,
          });
        }

        // Buffer the backend's next question for when we need a new one
        if (data.question && !bufferedNext.current) {
          bufferedNext.current = {
            node: data.nextNode,
            question: data.question,
          };
        }

        const newResolvedCount = resolvedSlots.current.size;

        setState((prev) => ({
          ...prev,
          feedback: data.feedback,
          previousMastery: data.feedback.masteryBefore,
          questionCount: prev.questionCount + 1,
          correctCount: prev.correctCount + (data.feedback.isCorrect ? 1 : 0),
          resolvedCount: newResolvedCount,
          resolvedCorrectCount:
            prev.resolvedCorrectCount + (resolvedViaCorrect ? 1 : 0),
        }));
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
        Cookies.set(
          `session_summary_${state.sessionId}`,
          JSON.stringify(data),
        );
        Cookies.set(
          `session_titles_${state.sessionId}`,
          JSON.stringify(nodeTitles.current),
        );
        Cookies.set(
          `session_docId_${state.sessionId}`,
          state.documentId ?? "",
        );
      }
      router.replace(`/session/${state.sessionId}/summary`);
      clearSession();
    } catch {
      toast.error("Unable to end session. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [state.sessionId, state.documentId, router, clearSession]);

  const handleContinue = useCallback(() => {
    // ── Mixed-type with retry queue (both normal & focused) ──
    const allResolved =
      resolvedSlots.current.size >= MAX_SESSION_QUESTIONS &&
      retryQueue.current.length === 0;
    if (allResolved) {
      // Show SESSION COMPLETE screen
      setState((prev) => ({
        ...prev,
        currentQuestion: null,
        feedback: null,
      }));
      return;
    }

    // Purge already-resolved entries from the retry queue
    retryQueue.current = retryQueue.current.filter(
      (r) => !resolvedSlots.current.has(r.slotIndex),
    );

    const hasRetries = retryQueue.current.length > 0;
    const canShowNew =
      nextNewSlot.current < MAX_SESSION_QUESTIONS &&
      bufferedNext.current?.question != null;

    // Decide whether to show a retry or a new question.
    // Never show two retries in a row — space them out with new questions.
    let showRetry = false;
    if (hasRetries && !canShowNew) {
      showRetry = true; // no new questions available, must show retry
    } else if (hasRetries && canShowNew && !lastWasRetry.current) {
      showRetry = Math.random() < 0.35;
    }

    if (showRetry) {
      const retry = retryQueue.current.shift()!;
      currentRetry.current = retry;
      currentSlotIndex.current = retry.slotIndex;
      lastWasRetry.current = true;

      const switchingConcepts =
        state.currentNode && retry.node.id !== state.currentNode.id;

      if (switchingConcepts) {
        pendingNext.current = {
          node: retry.node,
          question: retry.question,
        };
        setState((prev) => ({
          ...prev,
          feedback: null,
          previousNodeId: prev.currentNode?.id ?? null,
          currentNode: retry.node,
          isTransitioning: true,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          currentNode: retry.node,
          currentQuestion: retry.question,
          feedback: null,
          previousMastery: undefined,
          isTransitioning: false,
          questionKey: prev.questionKey + 1,
        }));
        questionStartTime.current = Date.now();
      }
    } else if (canShowNew) {
      const next = bufferedNext.current!;
      bufferedNext.current = null;
      currentRetry.current = null;
      currentSlotIndex.current = nextNewSlot.current;
      nextNewSlot.current++;
      lastWasRetry.current = false;

      const switchingConcepts =
        next.node &&
        state.currentNode &&
        next.node.id !== state.currentNode.id;

      if (switchingConcepts && next.node) {
        pendingNext.current = { node: next.node, question: next.question };
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
          currentNode: next.node ?? prev.currentNode,
          currentQuestion: next.question,
          feedback: null,
          previousMastery: undefined,
          isTransitioning: false,
          questionKey: prev.questionKey + 1,
        }));
        questionStartTime.current = Date.now();
      }
    } else {
      // No new questions available and no retries — end session
      setState((prev) => ({
        ...prev,
        currentQuestion: null,
        feedback: null,
      }));
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
      questionKey: prev.questionKey + 1,
    }));
    questionStartTime.current = Date.now();
    pendingNext.current = null;
  }, []);

  if (!documentId) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Spinner />
        {nodeId && (
          <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
            PREPARING QUESTIONS...
          </p>
        )}
      </div>
    );
  }

  if (!state.currentNode) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="font-mono text-xs text-[var(--color-text-muted)]">
          NO SESSION DATA
        </p>
      </div>
    );
  }

  const currentMastery = state.feedback
    ? state.feedback.masteryAfter
    : state.currentNode.masteryScore;

  const maxQuestions = MAX_SESSION_QUESTIONS;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {state.focusMode && (
        <div className="border-l-2 border-l-[var(--color-accent-primary)] bg-[var(--color-surface)] px-3 py-1.5">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent-primary)]">
            FOCUSED: {state.currentNode.title}
          </p>
        </div>
      )}

      <SessionHeader
        conceptName={state.currentNode.title}
        masteryScore={currentMastery}
        previousMasteryScore={state.previousMastery}
        currentQuestion={state.resolvedCount}
        totalQuestions={maxQuestions}
        correctCount={state.resolvedCorrectCount}
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
          key={`${state.currentQuestion.id}-${state.questionKey}`}
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
