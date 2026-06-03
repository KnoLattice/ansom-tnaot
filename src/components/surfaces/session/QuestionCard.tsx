"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Check, X as XIcon, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/Spinner";
import type { Question, FeedbackResult } from "@/lib/types/api";
import { bloomLevelLabel } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: Question;
  feedback: FeedbackResult | null;
  isSubmitting: boolean;
  onSubmit: (answer: string) => void;
  onContinue: () => void;
}

const TIMER_SECONDS_QCM = 30;
const TIMER_SECONDS_SHORT = 60;

export function QuestionCard({
  question,
  feedback,
  isSubmitting,
  onSubmit,
  onContinue,
}: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [shortAnswer, setShortAnswer] = useState("");
  const isQCM = question.questionType === "qcm";

  const timerDuration = isQCM ? TIMER_SECONDS_QCM : TIMER_SECONDS_SHORT;
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        if ((e.target as HTMLElement).tagName === "TEXTAREA") return;
        e.preventDefault();
      }
    },
    [],
  );

  const [localCorrect, setLocalCorrect] = useState<boolean | null>(null);

  const hasAnswered = isQCM ? localCorrect !== null : feedback !== null;
  const hasFeedback = feedback !== null;

  const shortAnswerRef = useRef(shortAnswer);
  shortAnswerRef.current = shortAnswer;
  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;

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
            if (isQCM) {
              setLocalCorrect(false);
              onSubmitRef.current("");
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
  }, [hasAnswered, isQCM]);

  const handleOptionClick = useCallback(
    (optionText: string) => {
      if (localCorrect !== null) return;
      setSelectedOption(optionText);

      const isCorrect =
        optionText.trim().toLowerCase() ===
        (question.correctAnswer ?? "").trim().toLowerCase();
      setLocalCorrect(isCorrect);

      onSubmit(optionText);
    },
    [localCorrect, question.correctAnswer, onSubmit],
  );

  const handleShortAnswerSubmit = () => {
    if (!shortAnswer.trim()) return;
    onSubmit(shortAnswer.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-5 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-6 shadow-sm"
      onKeyDown={handleKeyDown}
      onContextMenu={(e) => {
        if ((e.target as HTMLElement).tagName === "TEXTAREA") return;
        e.preventDefault();
      }}
      onDragStart={(e) => e.preventDefault()}
    >
      <div className="flex select-none flex-wrap items-center gap-2">
        <Badge variant="outline">
          {bloomLevelLabel(question.bloomLevel)}
        </Badge>
        <Badge variant="outline" >
          {isQCM ? "MCQ" : "SHORT"}
        </Badge>

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
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
            </span>
          </div>
        )}
      </div>

      <p className="select-none text-base leading-relaxed text-[var(--color-text-primary)]">
        {question.content}
      </p>

      {isQCM ? (
        <div className="select-none space-y-1" role="radiogroup" aria-label="Answer options">
          {question.options?.map((option) => {
            const isSelected = selectedOption === option.text;
            const isCorrectOption =
              hasAnswered &&
              option.text.trim().toLowerCase() ===
                (question.correctAnswer ?? "").trim().toLowerCase();
            const isWrongSelected = hasAnswered && isSelected && !localCorrect;

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
                  <span className="font-poppins text-xs font-bold text-[var(--color-text-muted)]">
                    {option.label}.
                  </span>{" "}
                  <span className="text-[var(--color-text-primary)]">{option.text}</span>
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <Textarea
          placeholder="Type your answer here..."
          value={shortAnswer}
          onChange={(e) => setShortAnswer(e.target.value)}
          disabled={hasFeedback}
          className="min-h-[100px] border-[var(--color-border-default)] bg-[var(--color-canvas)] font-mono text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
        />
      )}

      {isQCM && hasAnswered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
          className={cn(
            "select-none border-l-2 p-4",
            localCorrect
              ? "border-l-green-500 bg-green-500/5"
              : "border-l-red-500 bg-red-500/5",
          )}
        >
          <p
            className={cn(
              "font-poppins text-xs font-bold uppercase tracking-wider",
              localCorrect ? "text-green-400" : "text-red-400",
            )}
          >
            {localCorrect ? "CORRECT" : "INCORRECT"}
          </p>
          {!localCorrect && (
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Correct answer:{" "}
              <span className="font-medium text-[var(--color-text-primary)]">
                {question.correctAnswer}
              </span>
            </p>
          )}
        </motion.div>
      )}

      {!isQCM && hasFeedback && feedback && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
          className={cn(
            "select-none border-l-2 p-4",
            feedback.isCorrect
              ? "border-l-green-500 bg-green-500/5"
              : "border-l-red-500bg-red-500/5",
          )}
        >
          <p
            className={cn(
              "font-poppins text-xs font-bold uppercase tracking-wider",
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

      {/* Submit / Continue */}
      <div className="flex justify-end">
        {isQCM ? (
          hasAnswered && (
            <Button onClick={onContinue} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner size="sm" />
                  <span className="ml-2">UPDATING...</span>
                </>
              ) : (
                "CONTINUE"
              )}
            </Button>
          )
        ) : !hasFeedback ? (
          <Button
            disabled={!shortAnswer.trim() || isSubmitting}
            onClick={handleShortAnswerSubmit}
          >
            {isSubmitting ? <Spinner size="sm" /> : "SUBMIT"}
          </Button>
        ) : (
          <Button onClick={onContinue} > CONTINUE</Button>
        )}
      </div>
    </motion.div>
  );
}
