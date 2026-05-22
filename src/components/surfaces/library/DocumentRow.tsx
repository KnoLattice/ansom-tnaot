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
  completed: "text-green-400 border-green-500",
  processing: "text-yellow-400 border-yellow-500",
  pending: "text-cyan-400 border-cyan-500",
  failed: "text-red-400 border-red-500",
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
        "group flex items-center gap-4 border rounded-md border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-4 py-3 transition",
        isActive && "border-l-2 border-l-[var(--color-accent-primary)]",
        isReady && "hover:bg-[var(--color-surface-elevated)]",
      )}
    >
      {/* Active indicator */}
      <div className="flex h-6 w-6 shrink-0 items-center justify-center">
        {isActive && (
          <Star className="h-3.5 w-3.5 fill-[var(--color-accent-primary)] text-[var(--color-accent-primary)]" />
        )}
      </div>

      {/* Document info */}
      <div className="min-w-0 flex-1 border-l border-[var(--color-border-subtle)] pl-4">
        <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
          {document.originalName}
        </p>
        <p className="font-mono text-[10px] text-[var(--color-text-muted)]">
          {dayjs(document.uploadedAt).format("YYYY-MM-DD")} / {fileSizeMB.toFixed(1)}MB
        </p>
      </div>

      {/* Status badge */}
      <Badge
        variant="outline"
        className={cn(
          "shrink-0 rounded-sm border border-[var(--color-border-subtle)]",
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
              className="border border-[var(--color-border-default)] bg-[var(--color-canvas)] p-1.5 text-[var(--color-text-muted)] opacity-0 transition hover:text-[var(--color-text-primary)] group-hover:opacity-100"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-44 border-[var(--color-border-default)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
          >
            {!isActive && (
              <DropdownMenuItem
                className="font-mono text-xs uppercase tracking-wider"
                onClick={() => onSetActive(document.id)}
              >
                <Check className="mr-2 h-4 w-4" />
                Set active
              </DropdownMenuItem>
            )}
            {isReady && (
              <DropdownMenuItem
                className="font-mono text-xs uppercase tracking-wider"
                onClick={() => onViewMastery(document.id)}
              >
                <Map className="mr-2 h-4 w-4" />
                Mastery map
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="bg-[var(--color-border-default)]" />
            <AlertDialogTrigger asChild>
              <DropdownMenuItem className="font-mono text-xs uppercase tracking-wider text-red-400 focus:text-red-400">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialogContent className=" rounded-md border-[var(--color-border-default)] bg-[var(--color-surface)] text-[var(--color-text-primary)]">
          <AlertDialogHeader>
            <AlertDialogTitle>DELETE DOCUMENT?</AlertDialogTitle>
            <AlertDialogDescription className="text-[var(--color-text-secondary)]">
              This will permanently delete &ldquo;{document.originalName}&rdquo;
              and all associated concepts, mastery data, and session history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-md border-[var(--color-border-default)] bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] hover:bg-[var(--color-border-default)]">
              CANCEL
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-md bg-red-600 text-white hover:bg-red-700"
              onClick={() => onDelete(document.id)}
            >
              DELETE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
