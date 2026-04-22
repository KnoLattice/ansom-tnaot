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
  completed: "text-green-400 bg-green-500/10 border-green-500/20",
  processing: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  pending: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  failed: "text-red-400 bg-red-500/10 border-red-500/20",
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
        "group flex items-center gap-4 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 transition",
        isActive && "border-accent-primary/30 bg-accent-primary/5",
        isReady && "hover:bg-white/[0.06]",
      )}
    >
      {/* Active indicator */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center">
        {isActive && (
          <Star className="h-4 w-4 fill-accent-primary text-accent-primary" />
        )}
      </div>

      {/* Document info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">
          {document.originalName}
        </p>
        <p className="text-xs text-text-muted">
          {dayjs(document.uploadedAt).format("MMM D, YYYY")} · {fileSizeMB.toFixed(1)} MB
        </p>
      </div>

      {/* Status badge */}
      <Badge
        variant="outline"
        className={cn(
          "shrink-0 text-xs capitalize",
          statusColors[document.processingStatus] ?? "",
        )}
      >
        {document.processingStatus}
      </Badge>

      {/* Actions */}
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded-lg border border-white/10 bg-white/5 p-2 text-text-muted opacity-0 transition hover:text-white group-hover:opacity-100"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-44 border-white/10 bg-surface text-white"
          >
            {!isActive && (
              <DropdownMenuItem onClick={() => onSetActive(document.id)}>
                <Check className="mr-2 h-4 w-4" />
                Set as active
              </DropdownMenuItem>
            )}
            {isReady && (
              <DropdownMenuItem onClick={() => onViewMastery(document.id)}>
                <Map className="mr-2 h-4 w-4" />
                View mastery map
              </DropdownMenuItem>
            )}
            {/* TODO: Rename — backend needs PATCH /documents/:id endpoint */}
            <DropdownMenuSeparator className="bg-white/10" />
            <AlertDialogTrigger asChild>
              <DropdownMenuItem className="text-red-400 focus:text-red-400">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialogContent className="border-white/10 bg-surface text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription className="text-text-secondary">
              This will permanently delete &ldquo;{document.originalName}&rdquo;
              and all associated concepts, mastery data, and session history.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 bg-white/5 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => onDelete(document.id)}
            >
              Delete document
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
