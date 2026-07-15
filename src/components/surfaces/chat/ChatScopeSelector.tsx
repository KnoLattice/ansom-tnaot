"use client";

import { FileText, FolderOpen, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatScope } from "@/lib/types/api";

interface ChatScopeSelectorProps {
  onSelect: (scope: ChatScope, scopeId: string) => void;
  documents?: { id: string; originalName: string }[];
  collections?: { id: string; name: string }[];
  activeScope?: ChatScope;
  className?: string;
}

export function ChatScopeSelector({
  onSelect,
  documents = [],
  collections = [],
  activeScope,
  className,
}: ChatScopeSelectorProps) {
  return (
    <div className={cn("space-y-3 p-4", className)}>
      <p className="kl-data-label">Choose what to chat about</p>

      {collections.length > 0 && (
        <div>
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
            COLLECTIONS
          </p>
          <div className="flex flex-wrap gap-1.5">
            {collections.map((col) => (
              <button
                key={col.id}
                type="button"
                onClick={() => onSelect("collection", col.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 border rounded-md px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition",
                  activeScope === "collection"
                    ? "border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]"
                    : "border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
                )}
              >
                <FolderOpen className="h-3 w-3" />
                {col.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {documents.length > 0 && (
        <div>
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
            DOCUMENTS
          </p>
          <div className="flex flex-wrap gap-1.5">
            {documents.map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => onSelect("document", doc.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 border rounded-md px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition",
                  activeScope === "document"
                    ? "border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]"
                    : "border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
                )}
              >
                <FileText className="h-3 w-3" />
                {doc.originalName.replace(/\.[^.]+$/, "").slice(0, 30)}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="font-mono text-[10px] text-[var(--color-text-muted)]">
        <Lightbulb className="mr-1 inline h-3 w-3" />
        Concept-level chat is available from the mastery map
      </p>
    </div>
  );
}
