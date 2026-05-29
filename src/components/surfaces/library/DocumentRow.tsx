"use client";

import dayjs from "dayjs";
import { Check, MoreVertical, Trash2, Map, Star } from "lucide-react";
import type { Document } from "@/lib/types/api";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface DocumentRowProps {
  document: Document;
  isActive: boolean;
  onSetActive: (id: string) => void;
  onViewMastery: (id: string) => void;
  onDelete: (id: string) => void;
}

const statusColors: Record<string, string> = {
  completed: "bg-green-500/10 text-green-600",
  processing: "bg-yellow-500/10 text-yellow-600",
  pending: "bg-cyan-500/10 text-cyan-600",
  failed: "bg-red-500/10 text-red-600",
};

export function DocumentRow({
  document,
  isActive,
  onSetActive,
  onViewMastery,
  onDelete,
}: DocumentRowProps) {
  const isReady = document.processingStatus === "completed";
  const fileSizeMB = Number(document.fileSizeBytes ?? 0) / (1024 * 1024);

  return (
    <div
      className={cn(
        "group flex items-center gap-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-4 py-3.5 transition-all duration-200 shadow-sm",
        isActive && "border-[var(--color-accent-primary)]/30 bg-[var(--color-accent-primary)]/[0.03]",
        isReady && "hover:shadow-md hover:border-[var(--color-border-default)]",
      )}
    >
      {/* Active indicator */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
        {isActive && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent-primary)]/10">
            <Star className="h-4 w-4 fill-[var(--color-accent-primary)] text-[var(--color-accent-primary)]" />
          </div>
        )}
      </div>

      {/* Document info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
          {document.originalName}
        </p>
        <p className="text-[11px] text-[var(--color-text-muted)]">
          {dayjs(document.uploadedAt).format("YYYY-MM-DD")} · {fileSizeMB.toFixed(1)}MB
        </p>
      </div>

      {/* Status badge */}
      <Badge
        variant="outline"
        className={cn(
          "shrink-0 rounded-full border-none",
          statusColors[document.processingStatus] ?? "",
        )}
      >
        {document.processingStatus.toUpperCase()}
      </Badge>

      {/* Actions */}
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-canvas)] p-1.5 text-[var(--color-text-muted)] opacity-0 transition-all duration-200 hover:text-[var(--color-text-primary)] hover:shadow-sm group-hover:opacity-100"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-44 rounded-xl border-[var(--color-border-subtle)] bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-lg"
          >
            {!isActive && (
              <DropdownMenuItem
                className="rounded-lg text-sm"
                onClick={() => onSetActive(document.id)}
              >
                <Check className="mr-2 h-4 w-4" />
                Set active
              </DropdownMenuItem>
            )}
            {isReady && (
              <DropdownMenuItem
                className="rounded-lg text-sm"
                onClick={() => onViewMastery(document.id)}
              >
                <Map className="mr-2 h-4 w-4" />
                Mastery map
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="bg-[var(--color-border-subtle)]" />
            <AlertDialogTrigger asChild>
              <DropdownMenuItem className="rounded-lg text-sm text-red-500 focus:text-red-500">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialogContent className="rounded-2xl border-[var(--color-border-subtle)] bg-[var(--color-surface)] text-[var(--color-text-primary)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription className="text-[var(--color-text-secondary)]">
              This will permanently delete &ldquo;{document.originalName}&rdquo;
              and all associated concepts, mastery data, and session history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl"
              onClick={() => onDelete(document.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
