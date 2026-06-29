"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Check, X as XIcon, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/Spinner";
import type { Question, QuestionType, FeedbackResult } from "@/lib/types/api";
import { bloomLevelLabel } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: Question;
  feedback: FeedbackResult | null;
  isSubmitting: boolean;
  onSubmit: (answer: string, matchingAnswer?: Record<string, string>) => void;
  onContinue: () => void;
}

const TIMER_MAP: Record<QuestionType, number> = {
  qcm: 30,
  short_answer: 60,
  fill_blank: 30,
  true_false: 20,
  matching: 60,
};

const BADGE_MAP: Record<QuestionType, string> = {
  qcm: "MCQ",
  short_answer: "SHORT",
  fill_blank: "FILL",
  true_false: "T/F",
  matching: "MATCH",
};

/** Types that support instant local feedback (correctAnswer sent from backend) */
const LOCAL_FEEDBACK_TYPES: QuestionType[] = ["qcm", "true_false"];

export function QuestionCard({
  question,
  feedback,
  isSubmitting,
  onSubmit,
  onContinue,
}: QuestionCardProps) {
  const qType = question.questionType;
  const hasLocalFeedback = LOCAL_FEEDBACK_TYPES.includes(qType);

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [shortAnswer, setShortAnswer] = useState("");
  const [blankAnswer, setBlankAnswer] = useState("");
  const [tfSelected, setTfSelected] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});

  const timerDuration = TIMER_MAP[qType] ?? 30;
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "c") {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;
      e.preventDefault();
    }
  }, []);

  const [localCorrect, setLocalCorrect] = useState<boolean | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  const hasAnswered = hasLocalFeedback
    ? localCorrect !== null || timedOut
    : feedback !== null;
  const hasFeedback = feedback !== null;

  const shortAnswerRef = useRef(shortAnswer);
  shortAnswerRef.current = shortAnswer;
  const blankAnswerRef = useRef(blankAnswer);
  blankAnswerRef.current = blankAnswer;
  const matchesRef = useRef(matches);
  matchesRef.current = matches;
  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;

  // Reset state when question changes
  useEffect(() => {
    setSelectedOption(null);
    setShortAnswer("");
    setBlankAnswer("");
    setTfSelected(null);
    setMatches({});
    setLocalCorrect(null);
    setTimedOut(false);
    setTimeLeft(timerDuration);
  }, [question.id, timerDuration]);

  // Timer
  useEffect(() => {
    if (hasAnswered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);

          queueMicrotask(() => {
            if (hasLocalFeedback) {
              setTimedOut(true);
              onSubmitRef.current("");
            } else if (qType === "fill_blank") {
              onSubmitRef.current(blankAnswerRef.current.trim() || "");
            } else if (qType === "matching") {
              onSubmitRef.current("", matchesRef.current);
            } else {
              onSubmitRef.current(shortAnswerRef.current.trim() || "");
            }
          });

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasAnswered, hasLocalFeedback, qType]);

  // ─── MCQ handler ───
  const handleOptionClick = useCallback(
    (optionText: string) => {
      if (hasAnswered) return;
      setSelectedOption(optionText);
      const isCorrect =
        optionText.trim().toLowerCase() ===
        (question.correctAnswer ?? "").trim().toLowerCase();
      setLocalCorrect(isCorrect);
      onSubmit(optionText);
    },
    [hasAnswered, question.correctAnswer, onSubmit],
  );

  // ─── True/False handler ───
  const handleTFClick = useCallback(
    (value: string) => {
      if (hasAnswered) return;
      setTfSelected(value);
      const isCorrect =
        value.toLowerCase() ===
        (question.correctAnswer ?? "").trim().toLowerCase();
      setLocalCorrect(isCorrect);
      onSubmit(value);
    },
    [hasAnswered, question.correctAnswer, onSubmit],
  );

  // ─── Fill blank handler ───
  const handleBlankSubmit = () => {
    if (!blankAnswer.trim()) return;
    onSubmit(blankAnswer.trim());
  };

  // ─── Short answer handler ───
  const handleShortAnswerSubmit = () => {
    if (!shortAnswer.trim()) return;
    onSubmit(shortAnswer.trim());
  };

  // ─── Matching handler ───
  const matchingPairs = question.matchingPairs;
  const allMatched =
    matchingPairs &&
    matchingPairs.left.length > 0 &&
    matchingPairs.left.every((l) => !!matches[l]);

  const handleMatchSubmit = () => {
    if (!allMatched) return;
    onSubmit("", matches);
  };

  // ─── Content rendering for fill_blank ───
  const renderFillBlankContent = () => {
    const parts = question.content.split("___");
    if (parts.length < 2) {
      // Fallback if no blank marker found
      return (
        <>
          <p className="select-none text-base leading-relaxed text-[var(--color-text-primary)]">
            {question.content}
          </p>
          <Input
            type="text"
            placeholder="Your answer..."
            value={blankAnswer}
            onChange={(e) => setBlankAnswer(e.target.value)}
            disabled={hasFeedback}
            className="border-[var(--color-border-default)] bg-[var(--color-canvas)] font-mono text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !hasFeedback) handleBlankSubmit();
            }}
          />
        </>
      );
    }

    return (
      <p className="select-none text-base leading-relaxed text-[var(--color-text-primary)]">
        {parts[0]}
        <input
          type="text"
          value={blankAnswer}
          onChange={(e) => setBlankAnswer(e.target.value)}
          disabled={hasFeedback}
          placeholder="..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !hasFeedback) handleBlankSubmit();
          }}
          className={cn(
            "mx-1 inline-block w-40 border-b-2 bg-transparent px-1 py-0.5 text-center font-mono text-sm outline-none transition",
            hasFeedback && feedback?.isCorrect
              ? "border-green-500 text-green-400"
              : hasFeedback && !feedback?.isCorrect
                ? "border-red-500 text-red-400"
                : "border-[var(--color-accent-primary)] text-[var(--color-text-primary)]",
          )}
        />
        {parts[1]}
      </p>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
      className="space-y-5 border border-[var(--color-border-default)] bg-[var(--color-surface)] p-5"
      onKeyDown={handleKeyDown}
      onContextMenu={(e) => {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === "TEXTAREA" || tag === "INPUT") return;
        e.preventDefault();
      }}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Header badges + timer */}
      <div className="flex select-none flex-wrap items-center gap-2">
        <Badge variant="outline">{bloomLevelLabel(question.bloomLevel)}</Badge>
        <Badge variant="outline">{BADGE_MAP[qType] ?? qType.toUpperCase()}</Badge>

        {!hasAnswered && (
          <div
            className={cn(
              "ml-auto flex items-center gap-1.5 border px-2 py-1 font-mono text-[10px] font-bold tabular-nums",
              timeLeft <= 10
                ? "border-red-500 bg-red-500/10 text-red-400"
                : "border-[var(--color-border-default)] text-[var(--color-text-secondary)]",
            )}
          >
            <Clock className="h-3 w-3" />
            <span>
              {Math.floor(timeLeft / 60)}:
              {String(timeLeft % 60).padStart(2, "0")}
            </span>
          </div>
        )}
      </div>

      {/* ─── Question content + answer area ─── */}

      {/* Fill in the Blank */}
      {qType === "fill_blank" && renderFillBlankContent()}

      {/* All other types: show question text */}
      {qType !== "fill_blank" && (
        <p className="select-none text-base leading-relaxed text-[var(--color-text-primary)]">
          {question.content}
        </p>
      )}

      {/* MCQ options */}
      {qType === "qcm" && (
        <div
          className="select-none space-y-1"
          role="radiogroup"
          aria-label="Answer options"
        >
          {question.options?.map((option) => {
            const isSelected = selectedOption === option.text;
            const isCorrectOption =
              !timedOut &&
              hasAnswered &&
              option.text.trim().toLowerCase() ===
                (question.correctAnswer ?? "").trim().toLowerCase();
            const isWrongSelected =
              !timedOut && hasAnswered && isSelected && localCorrect === false;

            return (
              <button
                key={option.label}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleOptionClick(option.text)}
                disabled={hasAnswered}
                className={cn(
                  "group flex w-full items-center gap-3 border rounded-md px-4 py-3 text-left text-sm transition",
                  !hasAnswered &&
                    !isSelected &&
                    "border-[var(--color-border-subtle)] bg-[var(--color-canvas)] hover:border-[var(--color-border-default)] hover:bg-[var(--color-surface-elevated)]",
                  !hasAnswered &&
                    isSelected &&
                    "border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/5",
                  isCorrectOption && "border-green-500 bg-green-500/10",
                  isWrongSelected && "border-red-500 bg-red-500/10",
                  hasAnswered &&
                    !isCorrectOption &&
                    !isWrongSelected &&
                    "opacity-30",
                )}
              >
                {hasAnswered && isCorrectOption && (
                  <Check className="h-4 w-4 shrink-0 text-green-400" />
                )}
                {hasAnswered && isWrongSelected && (
                  <XIcon className="h-4 w-4 shrink-0 text-red-400" />
                )}
                <span>
                  <span className="font-mono text-xs font-bold text-[var(--color-text-muted)]">
                    {option.label}.
                  </span>{" "}
                  <span className="text-[var(--color-text-primary)]">
                    {option.text}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* True/False buttons */}
      {qType === "true_false" && (
        <div className="flex select-none gap-3">
          {["True", "False"].map((value) => {
            const isSelected = tfSelected === value;
            const isCorrectOption =
              !timedOut &&
              hasAnswered &&
              value.toLowerCase() ===
                (question.correctAnswer ?? "").trim().toLowerCase();
            const isWrongSelected =
              !timedOut && hasAnswered && isSelected && localCorrect === false;

            return (
              <button
                key={value}
                type="button"
                onClick={() => handleTFClick(value)}
                disabled={hasAnswered}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 border rounded-md py-4 font-mono text-sm font-bold uppercase tracking-wider transition",
                  !hasAnswered &&
                    !isSelected &&
                    "border-[var(--color-border-subtle)] bg-[var(--color-canvas)] hover:border-[var(--color-border-default)] hover:bg-[var(--color-surface-elevated)]",
                  !hasAnswered &&
                    isSelected &&
                    "border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/5",
                  isCorrectOption && "border-green-500 bg-green-500/10 text-green-400",
                  isWrongSelected && "border-red-500 bg-red-500/10 text-red-400",
                  hasAnswered &&
                    !isCorrectOption &&
                    !isWrongSelected &&
                    "opacity-30",
                )}
              >
                {hasAnswered && isCorrectOption && (
                  <Check className="h-4 w-4 shrink-0" />
                )}
                {hasAnswered && isWrongSelected && (
                  <XIcon className="h-4 w-4 shrink-0" />
                )}
                {value}
              </button>
            );
          })}
        </div>
      )}

      {/* Short Answer textarea */}
      {qType === "short_answer" && (
        <Textarea
          placeholder="Type your answer here..."
          value={shortAnswer}
          onChange={(e) => setShortAnswer(e.target.value)}
          disabled={hasFeedback}
          className="min-h-[100px] border-[var(--color-border-default)] bg-[var(--color-canvas)] font-mono text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
        />
      )}

      {/* Matching exercise */}
      {qType === "matching" && matchingPairs && (
        <div className="space-y-2">
          {matchingPairs.left.map((leftItem, idx) => {
            const selected = matches[leftItem] ?? "";
            const showResult = hasFeedback && feedback;

            // After feedback, check if this pair was correct
            let pairCorrect: boolean | null = null;
            if (showResult && feedback) {
              // feedback.correctAnswer contains the full correct pairs text from backend
              // We check by seeing if the selected matches the original pair ordering
              // But we just rely on the overall feedback for display
              pairCorrect = null; // Will be determined below
            }

            return (
              <div
                key={leftItem}
                className="flex items-center gap-3"
              >
                <div className="flex-1 rounded-md border border-[var(--color-border-default)] bg-[var(--color-canvas)] px-3 py-2 text-sm text-[var(--color-text-primary)]">
                  {leftItem}
                </div>
                <span className="text-[var(--color-text-muted)]">&rarr;</span>
                <select
                  value={selected}
                  onChange={(e) =>
                    setMatches((prev) => ({
                      ...prev,
                      [leftItem]: e.target.value,
                    }))
                  }
                  disabled={hasFeedback}
                  className={cn(
                    "flex-1 rounded-md border px-3 py-2 text-sm outline-none transition",
                    "border-[var(--color-border-default)] bg-[var(--color-canvas)] text-[var(--color-text-primary)]",
                    !selected && "text-[var(--color-text-muted)]",
                  )}
                >
                  <option value="">Select...</option>
                  {matchingPairs.right.map((rightItem) => (
                    <option key={rightItem} value={rightItem}>
                      {rightItem}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Feedback panels ─── */}

      {/* Local feedback for QCM and True/False */}
      {hasLocalFeedback && hasAnswered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
          className={cn(
            "select-none border-l-2 p-4",
            timedOut
              ? "border-l-yellow-500 bg-yellow-500/5"
              : localCorrect
                ? "border-l-green-500 bg-green-500/5"
                : "border-l-red-500 bg-red-500/5",
          )}
        >
          <p
            className={cn(
              "font-mono text-xs font-bold uppercase tracking-wider",
              timedOut
                ? "text-yellow-400"
                : localCorrect
                  ? "text-green-400"
                  : "text-red-400",
            )}
          >
            {timedOut ? "TIME EXPIRED" : localCorrect ? "CORRECT" : "INCORRECT"}
          </p>

          {(timedOut || !localCorrect) && (
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Correct answer:{" "}
              <span className="font-medium text-[var(--color-text-primary)]">
                {question.correctAnswer}
              </span>
            </p>
          )}
        </motion.div>
      )}

      {/* Server feedback for short_answer, fill_blank, matching */}
      {!hasLocalFeedback && hasFeedback && feedback && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
          className={cn(
            "select-none border-l-2 p-4",
            feedback.isCorrect
              ? "border-l-green-500 bg-green-500/5"
              : "border-l-red-500 rounded-r-md bg-red-500/5",
          )}
        >
          <p
            className={cn(
              "font-mono text-xs font-bold uppercase tracking-wider",
              feedback.isCorrect ? "text-green-400" : "text-red-400",
            )}
          >
            {feedback.isCorrect ? "CORRECT" : "INCORRECT"}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {feedback.evaluatorFeedback}
          </p>
          {!feedback.isCorrect && (
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Correct answer:{" "}
              <span className="font-medium text-[var(--color-text-primary)]">
                {feedback.correctAnswer}
              </span>
            </p>
          )}
        </motion.div>
      )}

      {/* ─── Submit / Continue ─── */}
      <div className="flex justify-end">
        {/* QCM and True/False: show Continue after local feedback */}
        {hasLocalFeedback ? (
          hasAnswered && (
            <Button
              onClick={onContinue}
              disabled={isSubmitting}
              className="rounded-md"
            >
              {isSubmitting ? <Spinner size="sm" /> : "CONTINUE"}
            </Button>
          )
        ) : qType === "fill_blank" ? (
          !hasFeedback ? (
            <Button
              disabled={!blankAnswer.trim() || isSubmitting}
              onClick={handleBlankSubmit}
              className="rounded-md"
            >
              {isSubmitting ? <Spinner size="sm" /> : "SUBMIT"}
            </Button>
          ) : (
            <Button onClick={onContinue} className="rounded-md">
              CONTINUE
            </Button>
          )
        ) : qType === "matching" ? (
          !hasFeedback ? (
            <Button
              disabled={!allMatched || isSubmitting}
              onClick={handleMatchSubmit}
              className="rounded-md"
            >
              {isSubmitting ? <Spinner size="sm" /> : "SUBMIT"}
            </Button>
          ) : (
            <Button onClick={onContinue} className="rounded-md">
              CONTINUE
            </Button>
          )
        ) : /* short_answer */
        !hasFeedback ? (
          <Button
            disabled={!shortAnswer.trim() || isSubmitting}
            onClick={handleShortAnswerSubmit}
            className="rounded-md"
          >
            {isSubmitting ? <Spinner size="sm" /> : "SUBMIT"}
          </Button>
        ) : (
          <Button onClick={onContinue} className="rounded-md">
            CONTINUE
          </Button>
        )}
      </div>
    </motion.div>
  );
}
