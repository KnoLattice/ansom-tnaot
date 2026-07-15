"use client";

import { useState } from "react";
import { FileText, FolderOpen, Lightbulb, Trash2 } from "lucide-react";
import { useChatConversations, useDeleteConversation } from "@/lib/hooks";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";
import type { ChatConversation, ChatScope } from "@/lib/types/api";

interface ChatHistorySidebarProps {
  activeConversationId: string | null;
  onSelect: (conversation: ChatConversation) => void;
  className?: string;
}

const SCOPE_ICONS: Record<ChatScope, typeof FileText> = {
  concept: Lightbulb,
  document: FileText,
  collection: FolderOpen,
};

const SCOPE_LABELS: Record<ChatScope, string> = {
  concept: "CONCEPTS",
  document: "DOCUMENTS",
  collection: "COLLECTIONS",
};

export function ChatHistorySidebar({
  activeConversationId,
  onSelect,
  className,
}: ChatHistorySidebarProps) {
  const { data: conversations, isLoading } = useChatConversations();
  const deleteConversation = useDeleteConversation();
  const [filter, setFilter] = useState<ChatScope | "all">("all");

  const filtered = conversations?.filter(
    (c) => filter === "all" || c.scope === filter,
  );

  const grouped = filtered?.reduce(
    (acc, conv) => {
      if (!acc[conv.scope]) acc[conv.scope] = [];
      acc[conv.scope].push(conv);
      return acc;
    },
    {} as Record<ChatScope, ChatConversation[]>,
  );

  return (
    <div className={cn("flex h-full flex-col border-r border-[var(--color-border-default)]", className)}>
      {/* Header */}
      <div className="border-b border-[var(--color-border-default)] p-3">
        <p className="kl-data-label mb-2">History</p>
        <div className="flex gap-1">
          {(["all", "concept", "document", "collection"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={cn(
                "rounded-md px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider transition",
                filter === s
                  ? "bg-[var(--color-accent-primary)] text-white"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]",
              )}
            >
              {s === "all" ? "ALL" : `${s.slice(0, 4)}.`}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations list */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : !filtered?.length ? (
          <div className="py-8 text-center">
            <p className="font-mono text-[10px] text-[var(--color-text-muted)]">
              No conversations yet
            </p>
          </div>
        ) : (
          <div className="p-2">
            {grouped &&
              (Object.keys(grouped) as ChatScope[]).map((scope) => {
                const Icon = SCOPE_ICONS[scope];
                return (
                  <div key={scope} className="mb-3">
                    <p className="mb-1 px-2 font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                      {SCOPE_LABELS[scope]}
                    </p>
                    {grouped[scope].map((conv) => (
                      <div
                        key={conv.id}
                        className={cn(
                          "group flex items-center gap-2 rounded-md px-2 py-1.5 transition",
                          activeConversationId === conv.id
                            ? "bg-[var(--color-accent-primary)]/10"
                            : "hover:bg-[var(--color-surface-elevated)]",
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => onSelect(conv)}
                          className="flex min-w-0 flex-1 items-center gap-2 text-left"
                        >
                          <Icon className="h-3 w-3 shrink-0 text-[var(--color-text-muted)]" />
                          <span className="truncate font-mono text-[10px] text-[var(--color-text-secondary)]">
                            {conv.title}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation.mutate(conv.id);
                          }}
                          className="hidden shrink-0 p-1 text-[var(--color-text-muted)] transition hover:text-[var(--color-destructive)] group-hover:block"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
