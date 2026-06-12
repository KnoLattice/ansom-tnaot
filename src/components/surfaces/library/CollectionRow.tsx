"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  FolderOpen,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import type { Collection, Document } from "@/lib/types/api";
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
import { CollectionDocumentRow } from "./CollectionDocumentRow";

interface CollectionRowProps {
  collection: Collection;
  documents: Document[];
  allCollections: Collection[];
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onDeleteDocument: (id: string) => void;
  onAssignDocument: (documentId: string, collectionId: string | null) => void;
  onViewMastery: (documentId: string) => void;
}

export function CollectionRow({
  collection,
  documents,
  allCollections,
  onRename,
  onDelete,
  onDeleteDocument,
  onAssignDocument,
  onViewMastery,
}: CollectionRowProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(collection.name);

  const masteryDisplay =
    collection.overallMastery !== null
      ? `${Math.round(collection.overallMastery * 100)}%`
      : "No data";

  const handleRename = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== collection.name) {
      onRename(collection.id, trimmed);
    }
    setIsEditing(false);
  };

  return (
    <div className="border rounded-md border-[var(--color-border-subtle)] bg-[var(--color-surface)]">
      {/* Collection header */}
      <div
        className="group flex cursor-pointer items-center gap-3 px-4 py-3 transition hover:bg-[var(--color-surface-elevated)]"
        onClick={() => setExpanded((e) => !e)}
      >
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 text-[var(--color-text-muted)] transition-transform",
            expanded && "rotate-90",
          )}
        />

        <FolderOpen className="h-4 w-4 shrink-0 text-[var(--color-accent-primary)]" />

        {/* Name */}
        {isEditing ? (
          <input
            autoFocus
            className="min-w-0 flex-1 border-b border-[var(--color-accent-primary)] bg-transparent text-sm font-medium text-[var(--color-text-primary)] outline-none"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
              if (e.key === "Escape") {
                setEditName(collection.name);
                setIsEditing(false);
              }
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <button
            className="min-w-0 flex-1 truncate text-left text-sm font-medium text-[var(--color-text-primary)] hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/library/collections/${collection.id}`);
            }}
          >
            {collection.name}
          </button>
        )}

        {/* Mastery badge */}
        <Badge
          variant="outline"
          className={cn(
            "shrink-0 rounded-sm border border-[var(--color-border-subtle)] font-mono text-[10px]",
            collection.overallMastery !== null
              ? "text-[var(--color-accent-primary)]"
              : "text-[var(--color-text-muted)]",
          )}
        >
          {masteryDisplay} mastery
        </Badge>

        {/* Document count */}
        <span className="shrink-0 font-mono text-[10px] text-[var(--color-text-muted)]">
          {collection.documentCount} doc{collection.documentCount !== 1 ? "s" : ""}
        </span>

        {/* Actions menu */}
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="border border-[var(--color-border-default)] bg-[var(--color-canvas)] p-1.5 text-[var(--color-text-muted)] opacity-0 transition hover:text-[var(--color-text-primary)] group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 border-[var(--color-border-default)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
            >
              <DropdownMenuItem
                className="font-mono text-xs uppercase tracking-wider"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                  setEditName(collection.name);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[var(--color-border-default)]" />
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  className="font-mono text-xs uppercase tracking-wider text-red-400 focus:text-red-400"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialogContent className="rounded-md border-[var(--color-border-default)] bg-[var(--color-surface)] text-[var(--color-text-primary)]">
            <AlertDialogHeader>
              <AlertDialogTitle>DELETE COLLECTION?</AlertDialogTitle>
              <AlertDialogDescription className="text-[var(--color-text-secondary)]">
                Delete &ldquo;{collection.name}&rdquo;? Your{" "}
                {collection.documentCount} document
                {collection.documentCount !== 1 ? "s" : ""} will not be
                deleted — they will move to Uncategorized.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-md border-[var(--color-border-default)] bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] hover:bg-[var(--color-border-default)]">
                CANCEL
              </AlertDialogCancel>
              <AlertDialogAction
                className="rounded-md bg-red-600 text-white hover:bg-red-700"
                onClick={() => onDelete(collection.id)}
              >
                DELETE
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Expanded document list */}
      {expanded && (
        <div className="border-t border-[var(--color-border-subtle)] bg-[var(--color-canvas)]">
          {documents.length === 0 ? (
            <p className="px-4 py-3 text-center font-mono text-[10px] text-[var(--color-text-muted)]">
              No documents in this collection
            </p>
          ) : (
            <div className="space-y-px p-2">
              {documents.map((doc) => (
                <CollectionDocumentRow
                  key={doc.id}
                  document={doc}
                  collections={allCollections}
                  currentCollectionId={collection.id}
                  onDelete={onDeleteDocument}
                  onAssign={onAssignDocument}
                  onViewMastery={onViewMastery}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
