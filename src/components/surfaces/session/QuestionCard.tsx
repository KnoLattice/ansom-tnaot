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
  qcm: "Multiple Choice",
  short_answer: "Short Answer",
  fill_blank: "Fill in the Blank",
  true_false: "True or False",
  matching: "Matching",
};

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
  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;

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
              onSubmitRef.current("", matches);
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

  const handleBlankSubmit = () => {
    if (!blankAnswer.trim()) return;
    onSubmit(blankAnswer.trim());
  };

  const handleShortAnswerSubmit = () => {
    if (!shortAnswer.trim()) return;
    onSubmit(shortAnswer.trim());
  };

  const matchingPairs = question.matchingPairs;
  const allMatched =
    matchingPairs &&
    matchingPairs.left.length > 0 &&
    matchingPairs.left.every((l) => !!matches[l]);

  const handleMatchSubmit = () => {
    if (!allMatched) return;
    onSubmit("", matches);
  };

  const renderFillBlankContent = () => {
    const parts = question.content.split("___");
    if (parts.length < 2) {
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
            className="rounded-xl border-[var(--color-border-default)] bg-[var(--color-surface-elevated)] text-sm"
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
              ? "border-emerald-500 text-emerald-600"
              : hasFeedback && !feedback?.isCorrect
                ? "border-red-500 text-red-600"
                : "border-[var(--color-accent-primary)] text-[var(--color-text-primary)]",
          )}
        />
        {parts[1]}
      </p>
    );
  };

  const timerPercent = (timeLeft / timerDuration) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-5 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6 shadow-soft-sm"
      onKeyDown={handleKeyDown}
      onContextMenu={(e) => {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === "TEXTAREA" || tag === "INPUT") return;
        e.preventDefault();
      }}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Header: type badge + timer */}
      <div className="flex select-none flex-wrap items-center gap-2">
        <span className="rounded-lg bg-[var(--color-accent-primary)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--color-accent-primary)]">
          {BADGE_MAP[qType] ?? qType}
        </span>
        <span className="rounded-lg bg-[var(--color-surface-elevated)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-muted)]">
          {bloomLevelLabel(question.bloomLevel)}
        </span>

        {!hasAnswered && (
          <div className="ml-auto flex items-center gap-2">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--color-surface-elevated)]">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-1000",
                  timeLeft <= 10 ? "bg-red-500" : "bg-[var(--color-accent-primary)]",
                )}
                style={{ width: `${timerPercent}%` }}
              />
            </div>
            <span
              className={cn(
                "font-mono text-xs font-semibold tabular-nums",
                timeLeft <= 10 ? "text-red-500" : "text-[var(--color-text-muted)]",
              )}
            >
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
            </span>
          </div>
        )}
      </div>

      {/* Question content */}
      {qType === "fill_blank" && renderFillBlankContent()}

      {qType !== "fill_blank" && (
        <p className="select-none text-lg leading-relaxed text-[var(--color-text-primary)]">
          {question.content}
        </p>
      )}

      {/* MCQ options */}
      {qType === "qcm" && (
        <div className="select-none space-y-2" role="radiogroup" aria-label="Answer options">
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
                  "group flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm transition-all",
                  !hasAnswered &&
                    !isSelected &&
                    "border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] hover:border-[var(--color-border-default)] hover:shadow-soft-sm",
                  !hasAnswered &&
                    isSelected &&
                    "border border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/5",
                  isCorrectOption && "border border-emerald-300 bg-emerald-50",
                  isWrongSelected && "border border-red-300 bg-red-50",
                  hasAnswered &&
                    !isCorrectOption &&
                    !isWrongSelected &&
                    "border border-transparent opacity-40",
                )}
              >
                {hasAnswered && isCorrectOption && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
                {hasAnswered && isWrongSelected && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500">
                    <XIcon className="h-3 w-3 text-white" />
                  </div>
                )}
                <span>
                  <span className="font-mono text-xs font-semibold text-[var(--color-text-muted)]">
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

      {/* True/False */}
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
                  "flex flex-1 items-center justify-center gap-2 rounded-xl py-4 text-sm font-semibold transition-all",
                  !hasAnswered &&
                    !isSelected &&
                    "border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] hover:border-[var(--color-border-default)] hover:shadow-soft-sm",
                  !hasAnswered &&
                    isSelected &&
                    "border border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/5 text-[var(--color-accent-primary)]",
                  isCorrectOption && "border border-emerald-300 bg-emerald-50 text-emerald-700",
                  isWrongSelected && "border border-red-300 bg-red-50 text-red-700",
                  hasAnswered &&
                    !isCorrectOption &&
                    !isWrongSelected &&
                    "border border-transparent opacity-40",
                )}
              >
                {hasAnswered && isCorrectOption && <Check className="h-4 w-4" />}
                {hasAnswered && isWrongSelected && <XIcon className="h-4 w-4" />}
                {value}
              </button>
            );
          })}
        </div>
      )}

      {/* Short Answer */}
      {qType === "short_answer" && (
        <Textarea
          placeholder="Type your answer here..."
          value={shortAnswer}
          onChange={(e) => setShortAnswer(e.target.value)}
          disabled={hasFeedback}
          className="min-h-[100px] rounded-xl border-[var(--color-border-default)] bg-[var(--color-surface-elevated)] text-sm placeholder:text-[var(--color-text-muted)]"
        />
      )}

      {/* Matching */}
      {qType === "matching" && matchingPairs && (
        <div className="space-y-2">
          {matchingPairs.left.map((leftItem) => {
            const selected = matches[leftItem] ?? "";
            return (
              <div key={leftItem} className="flex items-center gap-3">
                <div className="flex-1 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)]">
                  {leftItem}
                </div>
                <span className="text-[var(--color-text-muted)]">&rarr;</span>
                <select
                  value={selected}
                  onChange={(e) =>
                    setMatches((prev) => ({ ...prev, [leftItem]: e.target.value }))
                  }
                  disabled={hasFeedback}
                  className={cn(
                    "flex-1 rounded-xl border px-3.5 py-2.5 text-sm outline-none transition",
                    "border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)]",
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

      {/* Feedback panels */}
      {hasLocalFeedback && hasAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "select-none rounded-xl p-4",
            timedOut
              ? "bg-amber-50 border border-amber-200"
              : localCorrect
                ? "bg-emerald-50 border border-emerald-200"
                : "bg-red-50 border border-red-200",
          )}
        >
          <p
            className={cn(
              "text-sm font-semibold",
              timedOut
                ? "text-amber-700"
                : localCorrect
                  ? "text-emerald-700"
                  : "text-red-700",
            )}
          >
            {timedOut ? "Time expired" : localCorrect ? "Correct!" : "Incorrect"}
          </p>
          {(timedOut || !localCorrect) && (
            <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
              Correct answer:{" "}
              <span className="font-medium text-[var(--color-text-primary)]">
                {question.correctAnswer}
              </span>
            </p>
          )}
        </motion.div>
      )}

      {!hasLocalFeedback && hasFeedback && feedback && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "select-none rounded-xl p-4",
            feedback.isCorrect
              ? "bg-emerald-50 border border-emerald-200"
              : "bg-red-50 border border-red-200",
          )}
        >
          <p
            className={cn(
              "text-sm font-semibold",
              feedback.isCorrect ? "text-emerald-700" : "text-red-700",
            )}
          >
            {feedback.isCorrect ? "Correct!" : "Incorrect"}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {feedback.evaluatorFeedback}
          </p>
          {!feedback.isCorrect && (
            <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
              Correct answer:{" "}
              <span className="font-medium text-[var(--color-text-primary)]">
                {feedback.correctAnswer}
              </span>
            </p>
          )}
        </motion.div>
      )}

      {/* Submit / Continue */}
      <div className="flex justify-end">
        {hasLocalFeedback ? (
          hasAnswered && (
            <Button
              onClick={onContinue}
              disabled={isSubmitting}
              className="rounded-xl bg-[var(--color-accent-primary)] px-6 text-white hover:opacity-90"
            >
              {isSubmitting ? <Spinner size="sm" /> : "Continue"}
            </Button>
          )
        ) : qType === "fill_blank" ? (
          !hasFeedback ? (
            <Button
              disabled={!blankAnswer.trim() || isSubmitting}
              onClick={handleBlankSubmit}
              className="rounded-xl bg-[var(--color-accent-primary)] px-6 text-white hover:opacity-90"
            >
              {isSubmitting ? <Spinner size="sm" /> : "Submit"}
            </Button>
          ) : (
            <Button
              onClick={onContinue}
              className="rounded-xl bg-[var(--color-accent-primary)] px-6 text-white hover:opacity-90"
            >
              Continue
            </Button>
          )
        ) : qType === "matching" ? (
          !hasFeedback ? (
            <Button
              disabled={!allMatched || isSubmitting}
              onClick={handleMatchSubmit}
              className="rounded-xl bg-[var(--color-accent-primary)] px-6 text-white hover:opacity-90"
            >
              {isSubmitting ? <Spinner size="sm" /> : "Submit"}
            </Button>
          ) : (
            <Button
              onClick={onContinue}
              className="rounded-xl bg-[var(--color-accent-primary)] px-6 text-white hover:opacity-90"
            >
              Continue
            </Button>
          )
        ) : !hasFeedback ? (
          <Button
            disabled={!shortAnswer.trim() || isSubmitting}
            onClick={handleShortAnswerSubmit}
            className="rounded-xl bg-[var(--color-accent-primary)] px-6 text-white hover:opacity-90"
          >
            {isSubmitting ? <Spinner size="sm" /> : "Submit"}
          </Button>
        ) : (
          <Button
            onClick={onContinue}
            className="rounded-xl bg-[var(--color-accent-primary)] px-6 text-white hover:opacity-90"
          >
            Continue
          </Button>
        )}
      </div>
    </motion.div>
  );
}
