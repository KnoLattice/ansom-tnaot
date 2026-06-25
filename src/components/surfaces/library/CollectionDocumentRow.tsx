"use client";

import dayjs from "dayjs";
import {
  ArrowRightLeft,
  FolderPlus,
  Map,
  MoreVertical,
  Trash2,
  X,
} from "lucide-react";
import type { Collection, Document } from "@/lib/types/api";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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

interface CollectionDocumentRowProps {
  document: Document;
  collections: Collection[];
  currentCollectionId: string | null;
  onDelete: (id: string) => void;
  onAssign: (documentId: string, collectionId: string | null) => void;
  onViewMastery: (documentId: string) => void;
}

const statusStyles: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-600",
  processing: "bg-amber-50 text-amber-600",
  pending: "bg-blue-50 text-blue-600",
  failed: "bg-red-50 text-red-600",
};

const statusLabels: Record<string, string> = {
  completed: "Completed",
  processing: "Processing",
  pending: "Pending",
  failed: "Failed",
};

export function CollectionDocumentRow({
  document,
  collections,
  currentCollectionId,
  onDelete,
  onAssign,
  onViewMastery,
}: CollectionDocumentRowProps) {
  const isReady = document.processingStatus === "completed";
  const fileSizeMB = Number(document.fileSizeBytes ?? 0) / (1024 * 1024);
  const isUncollected = currentCollectionId === null;
  const otherCollections = collections.filter(
    (c) => c.id !== currentCollectionId,
  );

  return (
    <div className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-[var(--color-surface-elevated)]">
      {/* Document info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-[var(--color-text-primary)]">
          {document.originalName}
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          {dayjs(document.uploadedAt).format("MMM D, YYYY")} · {fileSizeMB.toFixed(1)} MB
        </p>
      </div>

      {/* Status badge */}
      <span
        className={cn(
          "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
          statusStyles[document.processingStatus] ?? "bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]",
        )}
      >
        {statusLabels[document.processingStatus] ?? document.processingStatus}
      </span>

      {/* Actions */}
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded-lg p-1.5 text-[var(--color-text-muted)] opacity-0 transition hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-primary)] group-hover:opacity-100"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-52 rounded-xl border-[var(--color-border-subtle)] bg-[var(--color-surface)] shadow-soft-md"
          >
            {isReady && (
              <DropdownMenuItem
                className="rounded-lg text-sm"
                onClick={() => onViewMastery(document.id)}
              >
                <Map className="mr-2 h-4 w-4" />
                Mastery map
              </DropdownMenuItem>
            )}

            {/* Assign / Move to collection */}
            {otherCollections.length > 0 && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="rounded-lg text-sm">
                  {isUncollected ? (
                    <FolderPlus className="mr-2 h-4 w-4" />
                  ) : (
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                  )}
                  {isUncollected ? "Add to collection" : "Move to collection"}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="rounded-xl border-[var(--color-border-subtle)] bg-[var(--color-surface)] shadow-soft-md">
                  {otherCollections.map((col) => (
                    <DropdownMenuItem
                      key={col.id}
                      className="rounded-lg text-sm"
                      onClick={() => onAssign(document.id, col.id)}
                    >
                      {col.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}

            {/* Remove from collection (only if in a collection) */}
            {!isUncollected && (
              <DropdownMenuItem
                className="rounded-lg text-sm"
                onClick={() => onAssign(document.id, null)}
              >
                <X className="mr-2 h-4 w-4" />
                Remove from collection
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

        <AlertDialogContent className="rounded-2xl border-[var(--color-border-subtle)] bg-[var(--color-surface)] shadow-soft-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-xl">Delete document?</AlertDialogTitle>
            <AlertDialogDescription className="text-[var(--color-text-secondary)]">
              This will permanently delete &ldquo;{document.originalName}&rdquo;
              and all associated concepts, mastery data, and session history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-[var(--color-border-default)]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-red-600 text-white hover:bg-red-700"
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
