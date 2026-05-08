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
    <div className="flex items-center gap-4 border border-[var(--color-border-default)] bg-[var(--color-surface)] px-4 py-3">
      {/* Concept name */}
      <div className="min-w-0 shrink-0">
        <p className="truncate font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-accent-primary)]">
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
            className="h-8 w-8 shrink-0 border border-[var(--color-border-default)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="border-[var(--color-border-default)] bg-[var(--color-surface)] text-[var(--color-text-primary)]">
          <AlertDialogHeader>
            <AlertDialogTitle>END SESSION?</AlertDialogTitle>
            <AlertDialogDescription className="text-[var(--color-text-secondary)]">
              Your progress will be saved. You can review your results in the
              summary.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              KEEP STUDYING
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onEndSession}
              disabled={isSubmitting}
            >
              END SESSION
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
