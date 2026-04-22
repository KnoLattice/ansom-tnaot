"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
  const answer = isQCM ? selectedOption : shortAnswer.trim();
  const hasAnswered = feedback !== null;

  const handleSubmit = () => {
    if (!answer) return;
    onSubmit(answer);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="space-y-6 rounded-2xl border border-white/8 bg-white/[0.03] p-6"
    >
      {/* Question meta */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="border-white/10 text-text-muted">
          {bloomLevelLabel(question.bloomLevel)}
        </Badge>
        <Badge variant="outline" className="border-white/10 capitalize text-text-muted">
          {question.questionType === "qcm" ? "Multiple choice" : "Short answer"}
        </Badge>
      </div>

      {/* Question stem */}
      <p className="text-base leading-relaxed text-white">
        {question.content}
      </p>

      {/* Answer area */}
      {isQCM ? (
        <div className="space-y-2" role="radiogroup" aria-label="Answer options">
          {question.options?.map((option) => {
            const isSelected = selectedOption === option.text;
            const isCorrectOption = hasAnswered && feedback?.correctAnswer === option.text;
            const isWrongSelected = hasAnswered && isSelected && !feedback?.isCorrect;

            return (
              <button
                key={option.label}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => !hasAnswered && setSelectedOption(option.text)}
                disabled={hasAnswered}
                className={cn(
                  "w-full rounded-xl border px-4 py-3 text-left text-sm transition",
                  !hasAnswered && !isSelected && "border-white/10 bg-white/[0.02] hover:bg-white/5",
                  !hasAnswered && isSelected && "border-accent-primary bg-accent-primary/10",
                  isCorrectOption && "border-green-500/40 bg-green-500/10",
                  isWrongSelected && "border-red-500/40 bg-red-500/10",
                  hasAnswered && !isCorrectOption && !isWrongSelected && "opacity-50",
                )}
              >
                <span className="font-medium text-text-secondary">{option.label}.</span>{" "}
                <span className="text-white">{option.text}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <Textarea
          placeholder="Type your answer here..."
          value={shortAnswer}
          onChange={(e) => setShortAnswer(e.target.value)}
          disabled={hasAnswered}
          className="min-h-[100px] border-white/10 bg-white/5 text-white placeholder:text-text-muted"
        />
      )}

      {/* Feedback */}
      {hasAnswered && feedback && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "rounded-xl border p-4",
            feedback.isCorrect
              ? "border-green-500/20 bg-green-500/5"
              : "border-red-500/20 bg-red-500/5",
          )}
        >
          <p className={cn(
            "text-sm font-medium",
            feedback.isCorrect ? "text-green-400" : "text-red-400",
          )}>
            {feedback.isCorrect ? "Correct!" : "Not quite."}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            {feedback.evaluatorFeedback}
          </p>
          {!feedback.isCorrect && (
            <p className="mt-2 text-sm text-text-muted">
              Correct answer: <span className="font-medium text-white">{feedback.correctAnswer}</span>
            </p>
          )}
        </motion.div>
      )}

      {/* Submit / Continue */}
      <div className="flex justify-end">
        {!hasAnswered ? (
          <Button
            disabled={!answer || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? <Spinner size="sm" /> : "Submit answer"}
          </Button>
        ) : (
          <Button onClick={onContinue}>
            Continue
          </Button>
        )}
      </div>
    </motion.div>
  );
}
