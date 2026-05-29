"use client";

import { X } from "lucide-react";
import { MasteryBar } from "@/components/shared/MasteryBar";
import { SessionProgressIndicator } from "@/components/shared/SessionProgressIndicator";
import { Button } from "@/components/ui/button";
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

interface SessionHeaderProps {
  conceptName: string;
  masteryScore: number;
  previousMasteryScore?: number;
  currentQuestion: number;
  totalQuestions: number;
  correctCount: number;
  isSubmitting: boolean;
  onEndSession: () => void;
}

export function SessionHeader({
  conceptName,
  masteryScore,
  previousMasteryScore,
  currentQuestion,
  totalQuestions,
  correctCount,
  isSubmitting,
  onEndSession,
}: SessionHeaderProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-5 py-3.5 shadow-sm">
      {/* Concept name */}
      <div className="min-w-0 shrink-0">
        <p className="truncate text-sm font-semibold text-[var(--color-accent-primary)]">
          {conceptName}
        </p>
      </div>

      {/* Live mastery bar */}
      <div className="flex-1">
        <MasteryBar
          score={masteryScore}
          previousScore={previousMasteryScore}
          size="sm"
          showLabel
          showDelta
        />
      </div>

      {/* Progress */}
      <div className="hidden shrink-0 sm:block sm:w-48">
        <SessionProgressIndicator
          current={currentQuestion}
          total={totalQuestions}
          correctCount={correctCount}
        />
      </div>

      {/* Exit */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="End session"
            className="h-9 w-9 shrink-0 rounded-xl border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]"
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-2xl border-[var(--color-border-subtle)] bg-[var(--color-surface)] text-[var(--color-text-primary)]">
          <AlertDialogHeader>
            <AlertDialogTitle>End session?</AlertDialogTitle>
            <AlertDialogDescription className="text-[var(--color-text-secondary)]">
              Your progress will be saved. You can review your results in the
              summary.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">
                Keep Studying
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onEndSession}
              disabled={isSubmitting}
              className="rounded-xl"
            >
              End Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
