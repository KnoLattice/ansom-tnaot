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

  // Refs to access latest values inside the interval callback
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
          // Auto-submit on timeout via microtask to avoid setState-in-setState
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
      if (localCorrect !== null) return; // already answered
      setSelectedOption(optionText);

      const isCorrect =
        optionText.trim().toLowerCase() ===
        (question.correctAnswer ?? "").trim().toLowerCase();
      setLocalCorrect(isCorrect);

      // Submit to backend for mastery update (runs in background)
      onSubmit(optionText);
    },
    [localCorrect, question.correctAnswer, onSubmit],
  );

  // Short answer: needs explicit submit
  const handleShortAnswerSubmit = () => {
    if (!shortAnswer.trim()) return;
    onSubmit(shortAnswer.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="space-y-6 rounded-2xl border border-white/8 bg-white/[0.03] p-6"
      onKeyDown={handleKeyDown}
      onContextMenu={(e) => {
        if ((e.target as HTMLElement).tagName === "TEXTAREA") return;
        e.preventDefault();
      }}
      onDragStart={(e) => e.preventDefault()}
    >
      <div className="flex select-none flex-wrap items-center gap-2">
        <Badge variant="outline" className="border-white/10 text-text-muted">
          {bloomLevelLabel(question.bloomLevel)}
        </Badge>
        <Badge
          variant="outline"
          className="border-white/10 capitalize text-text-muted"
        >
          {isQCM ? "Multiple choice" : "Short answer"}
        </Badge>

        {!hasAnswered && (
          <div
            className={cn(
              "ml-auto flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium tabular-nums",
              timeLeft <= 10
                ? "border-red-500/30 bg-red-500/10 text-red-400"
                : "border-white/10 bg-white/5 text-text-secondary",
            )}
          >
            <Clock className="h-3 w-3" />
            <span>
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
            </span>
          </div>
        )}
      </div>

      <p className="select-none text-base leading-relaxed text-white">
        {question.content}
      </p>

      {isQCM ? (
        <div className="select-none space-y-2" role="radiogroup" aria-label="Answer options">
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
                  "group flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition",
                  !hasAnswered &&
                    !isSelected &&
                    "border-white/10 bg-white/[0.02] hover:bg-white/5",
                  !hasAnswered &&
                    isSelected &&
                    "border-accent-primary bg-accent-primary/10",
                  isCorrectOption && "border-green-500/40 bg-green-500/10",
                  isWrongSelected && "border-red-500/40 bg-red-500/10",
                  hasAnswered &&
                    !isCorrectOption &&
                    !isWrongSelected &&
                    "opacity-40",
                )}
              >
                {hasAnswered && isCorrectOption && (
                  <Check className="h-4 w-4 shrink-0 text-green-400" />
                )}
                {hasAnswered && isWrongSelected && (
                  <XIcon className="h-4 w-4 shrink-0 text-red-400" />
                )}

                <span>
                  <span className="font-medium text-text-secondary">
                    {option.label}.
                  </span>{" "}
                  <span className="text-white">{option.text}</span>
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
          className="min-h-[100px] border-white/10 bg-white/5 text-white placeholder:text-text-muted"
        />
      )}

      {isQCM && hasAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "select-none rounded-xl border p-4",
            localCorrect
              ? "border-green-500/20 bg-green-500/5"
              : "border-red-500/20 bg-red-500/5",
          )}
        >
          <p
            className={cn(
              "text-sm font-medium",
              localCorrect ? "text-green-400" : "text-red-400",
            )}
          >
            {localCorrect ? "Correct!" : "Not quite."}
          </p>
          {!localCorrect && (
            <p className="mt-2 text-sm text-text-muted">
              The correct answer was:{" "}
              <span className="font-medium text-white">
                {question.correctAnswer}
              </span>
            </p>
          )}
          {/*{hasFeedback && feedback.evaluatorFeedback && (
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {feedback.evaluatorFeedback}
            </p>
          )}*/}
        </motion.div>
      )}

      {/* Short answer feedback (from backend) */}
      {!isQCM && hasFeedback && feedback && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "select-none rounded-xl border p-4",
            feedback.isCorrect
              ? "border-green-500/20 bg-green-500/5"
              : "border-red-500/20 bg-red-500/5",
          )}
        >
          <p
            className={cn(
              "text-sm font-medium",
              feedback.isCorrect ? "text-green-400" : "text-red-400",
            )}
          >
            {feedback.isCorrect ? "Correct!" : "Not quite."}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            {feedback.evaluatorFeedback}
          </p>
          {!feedback.isCorrect && (
            <p className="mt-2 text-sm text-text-muted">
              Correct answer:{" "}
              <span className="font-medium text-white">
                {feedback.correctAnswer}
              </span>
            </p>
          )}
        </motion.div>
      )}

      {/* Submit (short answer only) / Continue */}
      <div className="flex justify-end">
        {isQCM ? (
          // QCM: show Continue once answered (wait for backend before enabling)
          hasAnswered && (
            <Button onClick={onContinue} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner size="sm" />
                  <span className="ml-2">Updating mastery...</span>
                </>
              ) : (
                "Continue"
              )}
            </Button>
          )
        ) : !hasFeedback ? (
          <Button
            disabled={!shortAnswer.trim() || isSubmitting}
            onClick={handleShortAnswerSubmit}
          >
            {isSubmitting ? <Spinner size="sm" /> : "Submit answer"}
          </Button>
        ) : (
          <Button onClick={onContinue}>Continue</Button>
        )}
      </div>
    </motion.div>
  );
}
