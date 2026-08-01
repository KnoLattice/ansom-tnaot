"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X as XIcon, Clock, ThumbsUp, ThumbsDown, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
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

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

/** Types that support instant local feedback (correctAnswer sent from backend) */
const LOCAL_FEEDBACK_TYPES: QuestionType[] = ["qcm", "true_false"];

// ─── Circular SVG Timer ───────────────────────────────────────────────────────
function CircularTimer({
  timeLeft,
  duration,
}: {
  timeLeft: number;
  duration: number;
}) {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / duration;
  const offset = circumference * (1 - progress);

  const color =
    timeLeft <= 10
      ? "#ef4444"
      : timeLeft <= Math.floor(duration * 0.4)
        ? "#f59e0b"
        : "var(--color-accent-primary)";

  const minutes = Math.floor(timeLeft / 60);
  const seconds = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className="relative flex shrink-0 items-center justify-center" style={{ width: 44, height: 44 }}>
      <svg width="44" height="44" className="-rotate-90">
        {/* Track */}
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="var(--color-border-subtle)"
          strokeWidth="2.5"
        />
        {/* Progress ring */}
        <motion.circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transition={{ duration: 0.5, ease: "linear" }}
        />
      </svg>
      {/* Label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-[9px] font-bold tabular-nums leading-none"
          style={{ color }}
        >
          {minutes}:{seconds}
        </span>
      </div>
    </div>
  );
}

// ─── Feedback Banner ──────────────────────────────────────────────────────────
function FeedbackBanner({
  isCorrect,
  isTimedOut,
  evaluatorFeedback,
  correctAnswer,
}: {
  isCorrect: boolean | null;
  isTimedOut?: boolean;
  evaluatorFeedback?: string;
  correctAnswer?: string;
}) {
  const state = isTimedOut ? "timeout" : isCorrect ? "correct" : "incorrect";

  const config = {
    correct: {
      icon: <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />,
      label: "Correct!",
      labelColor: "text-green-400",
      border: "border-green-500/40",
      bg: "bg-green-500/8",
      leftBar: "bg-green-500",
    },
    incorrect: {
      icon: <XCircle className="h-5 w-5 shrink-0 text-red-400" />,
      label: "Incorrect",
      labelColor: "text-red-400",
      border: "border-red-500/40",
      bg: "bg-red-500/8",
      leftBar: "bg-red-500",
    },
    timeout: {
      icon: <AlertCircle className="h-5 w-5 shrink-0 text-yellow-400" />,
      label: "Time Expired",
      labelColor: "text-yellow-400",
      border: "border-yellow-500/40",
      bg: "bg-yellow-500/8",
      leftBar: "bg-yellow-500",
    },
  }[state];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "relative select-none overflow-hidden rounded-lg border p-4",
        config.border,
        config.bg,
      )}
    >
      {/* Left accent bar */}
      <div className={cn("absolute inset-y-0 left-0 w-1 rounded-l-lg", config.leftBar)} />

      <div className="flex items-start gap-3 pl-2">
        {config.icon}
        <div className="min-w-0 flex-1">
          <p className={cn("text-sm font-semibold", config.labelColor)}>
            {config.label}
          </p>
          {evaluatorFeedback && (
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {evaluatorFeedback}
            </p>
          )}
          {correctAnswer && (state === "incorrect" || state === "timeout") && (
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
              Correct answer:{" "}
              <span className="font-semibold text-[var(--color-text-primary)]">
                {correctAnswer}
              </span>
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
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
            className="mt-3 border-[var(--color-border-default)] bg-[var(--color-canvas)] text-sm focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)]/30 transition"
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
          placeholder="___"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !hasFeedback) handleBlankSubmit();
          }}
          className={cn(
            "mx-2 inline-block w-40 rounded-md border-b-2 border-x-0 border-t-0 bg-[var(--color-canvas)] px-2 py-0.5 text-center text-sm outline-none transition focus:border-[var(--color-accent-primary)]",
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="kl-card kl-elevation-1 space-y-5"
      onKeyDown={handleKeyDown}
      onContextMenu={(e) => {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === "TEXTAREA" || tag === "INPUT") return;
        e.preventDefault();
      }}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* ─── Header: badges + timer ─── */}
      <div className="flex select-none flex-wrap items-center gap-2">
        <Badge variant="outline" className="rounded-full text-[11px] font-semibold tracking-wider uppercase">
          {bloomLevelLabel(question.bloomLevel)}
        </Badge>
        <Badge variant="outline" className="rounded-full text-[11px] font-semibold tracking-wider uppercase">
          {BADGE_MAP[qType] ?? qType.toUpperCase()}
        </Badge>

        {!hasAnswered && (
          <div className="ml-auto">
            <CircularTimer timeLeft={timeLeft} duration={timerDuration} />
          </div>
        )}

        {hasAnswered && (
          <div className="ml-auto flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
            <span className="text-xs text-[var(--color-text-muted)] tabular-nums">Done</span>
          </div>
        )}
      </div>

      {/* ─── Question content ─── */}

      {/* Fill in the Blank */}
      {qType === "fill_blank" && renderFillBlankContent()}

      {/* All other types: show question text */}
      {qType !== "fill_blank" && (
        <p className="select-none text-[1.05rem] leading-relaxed text-[var(--color-text-primary)]">
          {question.content}
        </p>
      )}

      {/* ─── MCQ options ─── */}
      {qType === "qcm" && (
        <div
          className="select-none space-y-2"
          role="radiogroup"
          aria-label="Answer options"
        >
          {question.options?.map((option, idx) => {
            const isSelected = selectedOption === option.text;
            const isCorrectOption =
              !timedOut &&
              hasAnswered &&
              option.text.trim().toLowerCase() ===
                (question.correctAnswer ?? "").trim().toLowerCase();
            const isWrongSelected =
              !timedOut && hasAnswered && isSelected && localCorrect === false;
            const letter = OPTION_LABELS[idx] ?? option.label;

            return (
              <motion.button
                key={option.label}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleOptionClick(option.text)}
                disabled={hasAnswered}
                whileHover={!hasAnswered ? { scale: 1.005, x: 2 } : {}}
                whileTap={!hasAnswered ? { scale: 0.995 } : {}}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all duration-150",
                  !hasAnswered &&
                    !isSelected &&
                    "border-[var(--color-border-subtle)] bg-[var(--color-canvas)] hover:border-[var(--color-accent-primary)]/50 hover:bg-[var(--color-surface-elevated)]",
                  !hasAnswered &&
                    isSelected &&
                    "border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/8 shadow-[0_0_0_1px_var(--color-accent-primary)]",
                  isCorrectOption &&
                    "border-green-500/60 bg-green-500/8 shadow-[0_0_0_1px_rgba(34,197,94,0.3)]",
                  isWrongSelected &&
                    "border-red-500/60 bg-red-500/8 shadow-[0_0_0_1px_rgba(239,68,68,0.3)]",
                  hasAnswered &&
                    !isCorrectOption &&
                    !isWrongSelected &&
                    "opacity-25 cursor-not-allowed",
                )}
              >
                {/* Letter badge */}
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-all",
                    !hasAnswered && !isSelected &&
                      "bg-[var(--color-border-subtle)] text-[var(--color-text-muted)] group-hover:bg-[var(--color-accent-primary)]/20 group-hover:text-[var(--color-accent-primary)]",
                    !hasAnswered && isSelected &&
                      "bg-[var(--color-accent-primary)] text-[var(--color-canvas)]",
                    isCorrectOption &&
                      "bg-green-500 text-white",
                    isWrongSelected &&
                      "bg-red-500 text-white",
                    hasAnswered && !isCorrectOption && !isWrongSelected &&
                      "bg-[var(--color-border-subtle)] text-[var(--color-text-muted)]",
                  )}
                >
                  {isCorrectOption ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : isWrongSelected ? (
                    <XIcon className="h-3.5 w-3.5" />
                  ) : (
                    letter
                  )}
                </span>

                <span className="text-[var(--color-text-primary)]">
                  {option.text}
                </span>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* ─── True/False buttons ─── */}
      {qType === "true_false" && (
        <div className="grid select-none grid-cols-2 gap-3">
          {[
            { value: "True", icon: <ThumbsUp className="h-5 w-5" />, activeColor: "text-green-400", activeBorder: "border-green-500/60 bg-green-500/8 shadow-[0_0_0_1px_rgba(34,197,94,0.3)]" },
            { value: "False", icon: <ThumbsDown className="h-5 w-5" />, activeColor: "text-red-400", activeBorder: "border-red-500/60 bg-red-500/8 shadow-[0_0_0_1px_rgba(239,68,68,0.3)]" },
          ].map(({ value, icon, activeColor, activeBorder }) => {
            const isSelected = tfSelected === value;
            const isCorrectOption =
              !timedOut &&
              hasAnswered &&
              value.toLowerCase() ===
                (question.correctAnswer ?? "").trim().toLowerCase();
            const isWrongSelected =
              !timedOut && hasAnswered && isSelected && localCorrect === false;

            return (
              <motion.button
                key={value}
                type="button"
                onClick={() => handleTFClick(value)}
                disabled={hasAnswered}
                whileHover={!hasAnswered ? { scale: 1.02 } : {}}
                whileTap={!hasAnswered ? { scale: 0.97 } : {}}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 rounded-xl border py-6 text-sm font-semibold transition-all duration-150",
                  !hasAnswered &&
                    !isSelected &&
                    "border-[var(--color-border-subtle)] bg-[var(--color-canvas)] hover:border-[var(--color-accent-primary)]/50 hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]",
                  !hasAnswered &&
                    isSelected &&
                    "border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/8 shadow-[0_0_0_1px_var(--color-accent-primary)] text-[var(--color-accent-primary)]",
                  isCorrectOption &&
                    cn("border-green-500/60 bg-green-500/8 shadow-[0_0_0_1px_rgba(34,197,94,0.3)] text-green-400"),
                  isWrongSelected &&
                    cn("border-red-500/60 bg-red-500/8 shadow-[0_0_0_1px_rgba(239,68,68,0.3)] text-red-400"),
                  hasAnswered &&
                    !isCorrectOption &&
                    !isWrongSelected &&
                    "opacity-25 cursor-not-allowed text-[var(--color-text-muted)]",
                )}
              >
                {isCorrectOption ? (
                  <Check className="h-5 w-5" />
                ) : isWrongSelected ? (
                  <XIcon className="h-5 w-5" />
                ) : (
                  icon
                )}
                <span>{value}</span>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* ─── Short Answer textarea ─── */}
      {qType === "short_answer" && (
        <div className="space-y-1">
          <Textarea
            placeholder="Type your answer here..."
            value={shortAnswer}
            onChange={(e) => setShortAnswer(e.target.value)}
            disabled={hasFeedback}
            className="min-h-[110px] resize-none rounded-lg border-[var(--color-border-default)] bg-[var(--color-canvas)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)]/30 transition"
          />
          {!hasFeedback && (
            <p className="text-right text-xs text-[var(--color-text-muted)]">
              {shortAnswer.length > 0 ? `${shortAnswer.trim().split(/\s+/).filter(Boolean).length} word${shortAnswer.trim().split(/\s+/).filter(Boolean).length !== 1 ? "s" : ""}` : ""}
            </p>
          )}
        </div>
      )}

      {/* ─── Matching exercise ─── */}
      {qType === "matching" && matchingPairs && (
        <div className="space-y-2.5">
          {matchingPairs.left.map((leftItem, idx) => {
            const selected = matches[leftItem] ?? "";

            return (
              <motion.div
                key={leftItem}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.2 }}
                className="flex items-center gap-3"
              >
                <div className="flex-1 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-canvas)] px-3 py-2.5 text-sm text-[var(--color-text-primary)]">
                  {leftItem}
                </div>
                <span className="text-sm font-bold text-[var(--color-accent-primary)]">→</span>
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
                    "flex-1 rounded-lg border px-3 py-2.5 text-sm outline-none transition",
                    "border-[var(--color-border-default)] bg-[var(--color-canvas)] text-[var(--color-text-primary)]",
                    "focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)]/30",
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
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ─── Feedback panels ─── */}
      <AnimatePresence>
        {/* Local feedback for QCM and True/False */}
        {hasLocalFeedback && hasAnswered && (
          <FeedbackBanner
            isCorrect={timedOut ? null : localCorrect}
            isTimedOut={timedOut}
            correctAnswer={
              (timedOut || !localCorrect) ? (question.correctAnswer ?? undefined) : undefined
            }
          />
        )}

        {/* Server feedback for short_answer, fill_blank, matching */}
        {!hasLocalFeedback && hasFeedback && feedback && (
          <FeedbackBanner
            isCorrect={feedback.isCorrect}
            evaluatorFeedback={feedback.evaluatorFeedback}
            correctAnswer={!feedback.isCorrect ? (feedback.correctAnswer ?? undefined) : undefined}
          />
        )}
      </AnimatePresence>

      {/* ─── Submit / Continue ─── */}
      <div className="flex items-center justify-end gap-2 pt-1">
        {/* QCM and True/False: show Continue after local feedback */}
        {hasLocalFeedback ? (
          hasAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                onClick={onContinue}
                disabled={isSubmitting}
                className="min-w-[100px] rounded-lg"
              >
                {isSubmitting ? <Spinner size="sm" /> : "Continue →"}
              </Button>
            </motion.div>
          )
        ) : qType === "fill_blank" ? (
          !hasFeedback ? (
            <Button
              disabled={!blankAnswer.trim() || isSubmitting}
              onClick={handleBlankSubmit}
              className="min-w-[100px] rounded-lg"
            >
              {isSubmitting ? <Spinner size="sm" /> : "Submit"}
            </Button>
          ) : (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              <Button onClick={onContinue} className="min-w-[100px] rounded-lg">
                Continue →
              </Button>
            </motion.div>
          )
        ) : qType === "matching" ? (
          !hasFeedback ? (
            <Button
              disabled={!allMatched || isSubmitting}
              onClick={handleMatchSubmit}
              className="min-w-[100px] rounded-lg"
            >
              {isSubmitting ? <Spinner size="sm" /> : "Submit"}
            </Button>
          ) : (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              <Button onClick={onContinue} className="min-w-[100px] rounded-lg">
                Continue →
              </Button>
            </motion.div>
          )
        ) : /* short_answer */
        !hasFeedback ? (
          <Button
            disabled={!shortAnswer.trim() || isSubmitting}
            onClick={handleShortAnswerSubmit}
            className="min-w-[100px] rounded-lg"
          >
            {isSubmitting ? <Spinner size="sm" /> : "Submit"}
          </Button>
        ) : (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <Button onClick={onContinue} className="min-w-[100px] rounded-lg">
              Continue →
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
