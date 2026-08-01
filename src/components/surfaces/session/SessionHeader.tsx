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
    <div className="kl-glass-panel flex items-center gap-4 px-4 py-3">
      {/* Concept name with accent left indicator */}
      <div className="flex min-w-0 shrink-0 items-center gap-2">
        <span className="h-4 w-0.5 shrink-0 rounded-full bg-[var(--color-accent-primary)]" />
        <p className="truncate text-xs font-semibold text-[var(--color-accent-primary)]">
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
            className="h-8 w-8 shrink-0 rounded-lg border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] transition hover:border-red-500/40 hover:bg-red-500/8 hover:text-red-400"
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-xl border-[var(--color-border-default)] bg-[var(--color-surface)] text-[var(--color-text-primary)]">
          <AlertDialogHeader>
            <AlertDialogTitle>End Session?</AlertDialogTitle>
            <AlertDialogDescription className="text-[var(--color-text-secondary)]">
              Your progress will be saved. You can review your results in the
              summary.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg border">
              Keep Studying
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onEndSession}
              disabled={isSubmitting}
              className="rounded-lg border"
            >
              End Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
