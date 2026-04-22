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
    <div className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-3">
      {/* Concept name */}
      <div className="min-w-0 shrink-0">
        <p className="truncate text-sm font-medium text-white">
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
            className="h-9 w-9 shrink-0 rounded-full border border-white/10 text-text-muted hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="border-white/10 bg-surface text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>End session?</AlertDialogTitle>
            <AlertDialogDescription className="text-text-secondary">
              Your progress will be saved. You can review your results in the
              summary.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 bg-white/5 text-white hover:bg-white/10">
              Keep studying
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onEndSession}
              disabled={isSubmitting}
            >
              End session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
