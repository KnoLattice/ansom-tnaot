"use client";

import { FileText, Brain, GitBranch, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import type { ProcessingStatus } from "@/lib/types/api";
import { cn } from "@/lib/utils";

const STAGES = [
  { label: "Extracting text", icon: FileText },
  { label: "Identifying concepts", icon: Brain },
  { label: "Mapping relationships", icon: GitBranch },
  { label: "Building your graph", icon: CheckCircle2 },
] as const;

function getActiveStageIndex(status: ProcessingStatus): number {
  switch (status) {
    case "pending":
      return 0;
    case "processing":
      return 2;
    case "completed":
      return STAGES.length;
    case "failed":
      return -1;
    default:
      return 0;
  }
}

interface ProcessingPipelineProps {
  status: ProcessingStatus;
  errorMessage?: string | null;
  documentName: string;
  elapsedSeconds: number;
}

export function ProcessingPipeline({
  status,
  errorMessage,
  documentName,
  elapsedSeconds,
}: ProcessingPipelineProps) {
  const activeIndex = getActiveStageIndex(status);
  const isFailed = status === "failed";
  const isComplete = status === "completed";

  return (
    <div className="w-full space-y-6 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-8">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-widest text-text-muted">
          {isFailed ? "Processing failed" : isComplete ? "Processing complete" : "Processing"}
        </p>
        <h3 className="mt-1 text-lg font-semibold text-[var(--color-text-primary)]">{documentName}</h3>
        {!isComplete && !isFailed && (
          <p className="mt-0.5 text-sm text-text-muted tabular-nums">
            {elapsedSeconds}s elapsed
          </p>
        )}
      </div>

      {/* Pipeline stages */}
      <div className="grid gap-3 sm:grid-cols-4">
        {STAGES.map((stage, index) => {
          const Icon = stage.icon;
          const isDone = index < activeIndex;
          const isActive = index === activeIndex && !isFailed && !isComplete;

          return (
            <div
              key={stage.label}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border border-[var(--color-border-subtle)] px-3 py-4 text-center transition",
                isDone && "border-green-500/20 bg-green-500/5",
                isActive && "border-accent-primary/30 bg-accent-primary/5",
                isFailed && "border-red-500/20 bg-red-500/5",
              )}
            >
              <div className="flex h-8 w-8 items-center justify-center">
                {isFailed ? (
                  <AlertCircle className="h-5 w-5 text-red-400" />
                ) : isDone ? (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                ) : isActive ? (
                  <Loader2 className="h-5 w-5 animate-spin text-accent-primary" />
                ) : (
                  <Icon className="h-5 w-5 text-text-muted" />
                )}
              </div>
              <p
                className={cn(
                  "text-xs font-medium",
                  isDone
                    ? "text-green-400"
                    : isActive
                      ? "text-[var(--color-text-primary)]"
                      : isFailed
                        ? "text-red-400"
                        : "text-text-muted",
                )}
              >
                {stage.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Overall progress bar */}
      {!isFailed && (
        <div className="h-2 overflow-hidden rounded-full bg-[var(--color-border-subtle)]">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              isComplete ? "bg-green-500" : "bg-accent-primary",
            )}
            style={{
              width: `${isComplete ? 100 : Math.min(95, (activeIndex / STAGES.length) * 100)}%`,
            }}
          />
        </div>
      )}

      {/* Error message */}
      {isFailed && errorMessage && (
        <p className="text-sm text-red-400">
          We couldn&apos;t process this file: {errorMessage}
        </p>
      )}
    </div>
  );
}
