"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAtom, useSetAtom } from "jotai";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MasteryBar } from "@/components/ui/MasteryBar";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/Spinner";
import {
  clearSessionAtom,
  currentNodeAtom,
  currentQuestionAtom,
  isSubmittingAtom,
  lastFeedbackAtom,
  questionStartTimeAtom,
  sessionDocumentIdAtom,
  sessionIdAtom,
  sessionStatsAtom,
} from "@/lib/stores/session.store";
import { apiClient } from "@/lib/api/client";
import { API_ROUTES } from "@/lib/api/routes";
import type {
  EndSessionResponse,
  RespondResponse,
  StartSessionResponse,
} from "@/lib/types/api";
import { bloomLevelLabel, formatDuration } from "@/lib/utils/format";
import { masteryDeltaLabel } from "@/lib/utils/mastery";
import { MasteryBadge } from "@/components/ui/MasteryBadge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SessionPage() {
  const searchParams = useSearchParams();
  const documentId = searchParams.get("documentId");
  const router = useRouter();
  const [sessionId, setSessionId] = useAtom(sessionIdAtom);
  const [sessionDocumentId, setSessionDocumentId] = useAtom(sessionDocumentIdAtom);
  const [currentNode, setCurrentNode] = useAtom(currentNodeAtom);
  const [currentQuestion, setCurrentQuestion] = useAtom(currentQuestionAtom);
  const [sessionStats, setSessionStats] = useAtom(sessionStatsAtom);
  const [lastFeedback, setLastFeedback] = useAtom(lastFeedbackAtom);
  const [isSubmitting, setIsSubmitting] = useAtom(isSubmittingAtom);
  const [questionStartTime, setQuestionStartTime] = useAtom(questionStartTimeAtom);
  const clearSession = useSetAtom(clearSessionAtom);

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [shortAnswer, setShortAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<EndSessionResponse | null>(null);
  const [nodeTitleMap, setNodeTitleMap] = useState<Record<string, string>>({});

  const startSession = useCallback(async () => {
    if (!documentId) return;
    setLoading(true);
    try {
      const { data } = await apiClient.get<StartSessionResponse>(
        API_ROUTES.SESSIONS.START,
        {
          params: { documentId },
        },
      );
      setSessionId(data.sessionId);
      setSessionDocumentId(documentId);
      setCurrentNode(data.targetNode);
      setCurrentQuestion(data.question);
      setSessionStats(data.sessionStats);
      setLastFeedback(null);
      setQuestionStartTime(Date.now());
      setSelectedOption(null);
      setShortAnswer("");
      setSummary(null);
      setNodeTitleMap({ [data.targetNode.id]: data.targetNode.title });
    } catch (error) {
      console.error(error);
      toast.error("Unable to start session. Check if your document is ready.");
      router.replace(`/graph?documentId=${documentId}`);
    } finally {
      setLoading(false);
    }
  }, [documentId, router, setCurrentNode, setCurrentQuestion, setLastFeedback, setQuestionStartTime, setSessionDocumentId, setSessionId, setSessionStats]);

  useEffect(() => {
    if (!documentId) {
      router.replace("/space");
      return;
    }
    if (!sessionId || sessionDocumentId !== documentId) {
      startSession();
    }
  }, [documentId, router, sessionDocumentId, sessionId, startSession]);

  useEffect(() => {
    if (currentNode) {
      setNodeTitleMap((prev) => ({ ...prev, [currentNode.id]: currentNode.title }));
    }
  }, [currentNode]);

  const handleSubmitAnswer = useCallback(async () => {
    if (!sessionId || !currentNode || !currentQuestion) return;
    const answer =
      currentQuestion.questionType === "qcm"
        ? selectedOption
        : shortAnswer.trim();
    if (!answer) {
      toast.warning("Select or enter an answer first");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        sessionId,
        nodeId: currentNode.id,
        questionId: currentQuestion.id,
        selectedAnswer: answer,
        responseTimeMs: questionStartTime
          ? Date.now() - questionStartTime
          : undefined,
      };
      const { data } = await apiClient.post<RespondResponse>(
        API_ROUTES.SESSIONS.RESPOND,
        payload,
      );
      setLastFeedback(data.feedback);
      if (data.nextNode) {
        setCurrentNode(data.nextNode);
        setNodeTitleMap((prev) => ({ ...prev, [data.nextNode!.id]: data.nextNode!.title }));
      }
      if (data.question) {
        setCurrentQuestion(data.question);
        setQuestionStartTime(Date.now());
        setSelectedOption(null);
        setShortAnswer("");
      } else {
        setCurrentQuestion(null);
      }
    } catch (error) {
      console.error(error);
      toast.error("Could not submit answer. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  }, [currentNode, currentQuestion, questionStartTime, selectedOption, sessionId, setCurrentNode, setCurrentQuestion, setIsSubmitting, setLastFeedback, setQuestionStartTime, shortAnswer]);

  const handleEndSession = useCallback(async () => {
    if (!sessionId) return;
    setIsSubmitting(true);
    try {
      const { data } = await apiClient.post<EndSessionResponse>(
        API_ROUTES.SESSIONS.END,
        { sessionId },
      );
      setSummary(data);
      clearSession();
      const destination = sessionDocumentId ?? documentId;
      if (destination) {
        router.replace(`/space?documentId=${destination}`);
      } else {
        router.replace("/space");
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to end session. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [clearSession, documentId, router, sessionDocumentId, sessionId, setIsSubmitting]);

  const currentAnswer = useMemo(() => {
    if (!currentQuestion) return "";
    return currentQuestion.questionType === "qcm"
      ? selectedOption ?? ""
      : shortAnswer;
  }, [currentQuestion, selectedOption, shortAnswer]);

  if (loading || !documentId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (summary) {
    return (
      <SessionSummary
        summary={summary}
        onStudyAgain={() => startSession()}
        onViewProgress={() => router.push(`/progress?documentId=${documentId}`)}
        titleMap={nodeTitleMap}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Adaptive session</p>
          <h1 className="text-3xl font-semibold">
            Focus: {currentNode?.title ?? "Loading"}
          </h1>
          {currentNode && (
            <div className="mt-2 flex items-center gap-3">
              <MasteryBar score={currentNode.masteryScore} showLabel size="sm" />
              <MasteryBadge band={currentNode.masteryBand} />
            </div>
          )}
          {sessionStats && (
            <p className="mt-2 text-xs text-muted-foreground">
              Eligible concepts: {sessionStats.eligibleNodes} / {sessionStats.totalNodes}
            </p>
          )}
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost">End session</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>End session?</AlertDialogTitle>
              <AlertDialogDescription>
                Your accuracy and mastery updates will be saved.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep studying</AlertDialogCancel>
              <AlertDialogAction onClick={handleEndSession} disabled={isSubmitting}>
                End session
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {currentQuestion ? (
        <Card>
          <CardHeader>
            <CardTitle>Question</CardTitle>
            <CardDescription>{currentNode?.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary">
                Bloom: {bloomLevelLabel(currentQuestion.bloomLevel)}
              </Badge>
              <Badge variant="outline">{currentQuestion.questionType}</Badge>
            </div>
            <p className="text-base">{currentQuestion.content}</p>
            {currentQuestion.questionType === "qcm" ? (
              <div className="grid gap-2">
                {currentQuestion.options?.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setSelectedOption(option.text)}
                    className={cn(
                      "rounded-xl border p-3 text-left transition hover:border-primary",
                      selectedOption === option.text && "border-primary bg-primary/5",
                    )}
                  >
                    <span className="font-medium">{option.label}</span>. {option.text}
                  </button>
                ))}
              </div>
            ) : (
              <Textarea
                placeholder="Type your answer here..."
                value={shortAnswer}
                onChange={(event) => setShortAnswer(event.target.value)}
              />
            )}
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Response time is tracked for personalization.
            </p>
            <Button
              disabled={!currentAnswer || isSubmitting}
              onClick={handleSubmitAnswer}
            >
              {isSubmitting ? <Spinner size="sm" /> : "Submit answer"}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No more questions</CardTitle>
            <CardDescription>
              All eligible concepts are exhausted for now. End the session to see your summary.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={handleEndSession} disabled={isSubmitting}>End session</Button>
          </CardFooter>
        </Card>
      )}

      {lastFeedback && (
        <FeedbackCard feedback={lastFeedback} />
      )}
    </div>
  );
}

function FeedbackCard({
  feedback,
}: {
  feedback: RespondResponse["feedback"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback</CardTitle>
        <CardDescription>
          {feedback.isCorrect ? "Great work!" : "Review and try again."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>{feedback.evaluatorFeedback}</p>
        <p className="text-muted-foreground">
          Correct answer: <span className="font-medium">{feedback.correctAnswer}</span>
        </p>
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span>Before: {Math.round(feedback.masteryBefore * 100)}%</span>
          <span>After: {Math.round(feedback.masteryAfter * 100)}%</span>
          <span>Delta: {masteryDeltaLabel(feedback.masteryDelta)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function SessionSummary({
  summary,
  onStudyAgain,
  onViewProgress,
  titleMap,
}: {
  summary: EndSessionResponse;
  onStudyAgain: () => void;
  onViewProgress: () => void;
  titleMap: Record<string, string>;
}) {
  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Session complete 🎉</CardTitle>
        <CardDescription>
          {formatDuration(summary.durationMs)} · {summary.totalInteractions} questions · {summary.accuracy}% accuracy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Interactions" value={summary.totalInteractions} />
          <Stat label="Correct" value={summary.correctCount} />
          <Stat label="Accuracy" value={`${summary.accuracy}%`} />
        </div>
        <div className="space-y-2 text-sm">
          {summary.nodesStudied.map((node) => (
            <div key={node.nodeId} className="flex items-center justify-between rounded-xl border p-3">
              <div>
                <p className="font-medium">{titleMap[node.nodeId] ?? node.nodeId}</p>
                <p className="text-xs text-muted-foreground">
                  {Math.round(node.masteryBefore * 100)}% → {Math.round(node.masteryAfter * 100)}%
                </p>
              </div>
              <Badge variant={node.delta >= 0 ? "secondary" : "destructive"}>
                {masteryDeltaLabel(node.delta)}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-3">
        <Button onClick={onStudyAgain}>Start new session</Button>
        <Button variant="outline" onClick={onViewProgress}>
          View progress
        </Button>
      </CardFooter>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border p-3 text-center">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
