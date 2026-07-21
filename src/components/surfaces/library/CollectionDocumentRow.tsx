"use client";

import dayjs from "dayjs";
import {
  ArrowRightLeft,
  Check,
  FolderPlus,
  Map,
  MoreVertical,
  Trash2,
  X,
} from "lucide-react";
import type { Collection, Document } from "@/lib/types/api";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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
  isActive: boolean;
  onDelete: (id: string) => void;
  onAssign: (documentId: string, collectionId: string | null) => void;
  onSetActive: (id: string) => void;
  onViewMastery: (documentId: string) => void;
}

const statusColors: Record<string, string> = {
  completed: "text-green-400 border-green-500",
  processing: "text-yellow-400 border-yellow-500",
  pending: "text-cyan-400 border-cyan-500",
  failed: "text-red-400 border-red-500",
};

export function CollectionDocumentRow({
  document,
  collections,
  currentCollectionId,
  isActive,
  onDelete,
  onAssign,
  onSetActive,
  onViewMastery,
}: CollectionDocumentRowProps) {
  const isReady = document.processingStatus === "completed";
  const fileSizeMB = Number(document.fileSizeBytes ?? 0) / (1024 * 1024);
  const isUncollected = currentCollectionId === null;
  const otherCollections = collections.filter(
    (c) => c.id !== currentCollectionId,
  );

  return (
    <div className="group flex items-center gap-3 rounded px-3 py-2 transition bg-[var(--color-surface)] hover:bg-[var(--color-canvas)]">
      {/* Document info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-[var(--color-text-primary)]">
          {document.originalName}
        </p>
        <p className="font-mono text-[10px] text-[var(--color-text-muted)]">
          {dayjs(document.uploadedAt).format("YYYY-MM-DD")} /{" "}
          {fileSizeMB.toFixed(1)}MB
        </p>
      </div>

      {/* Status badge */}
      <Badge
        variant="outline"
        className={cn(
          "shrink-0 rounded-sm border border-[var(--color-border-subtle)] text-[10px]",
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
              className="border border-[var(--color-border-default)] bg-[var(--color-canvas)] p-1 text-[var(--color-text-muted)] opacity-0 transition hover:text-[var(--color-text-primary)] group-hover:opacity-100"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-52 border-[var(--color-border-default)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
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

            {/* Assign / Move to collection */}
            {otherCollections.length > 0 && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="font-mono text-xs uppercase tracking-wider">
                  {isUncollected ? (
                    <FolderPlus className="mr-2 h-4 w-4" />
                  ) : (
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                  )}
                  {isUncollected ? "Add to collection" : "Move to collection"}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="border-[var(--color-border-default)] bg-[var(--color-surface)] text-[var(--color-text-primary)]">
                  {otherCollections.map((col) => (
                    <DropdownMenuItem
                      key={col.id}
                      className="text-xs"
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
                className="font-mono text-xs uppercase tracking-wider"
                onClick={() => onAssign(document.id, null)}
              >
                <X className="mr-2 h-4 w-4" />
                Remove from collection
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

        <AlertDialogContent className="rounded-md border-[var(--color-border-default)] bg-[var(--color-surface)] text-[var(--color-text-primary)]">
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
