"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Lightbulb, ClipboardList, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api/client";
import { API_ROUTES } from "@/lib/api/routes";
import { useChatSessions } from "@/lib/hooks/useChat";
import type { ChatScope, MentionRef } from "@/lib/types/api";

interface ChatMentionDropdownProps {
  scope: ChatScope;
  scopeId: string;
  query: string;
  onSelect: (mention: MentionRef) => void;
  onClose: () => void;
}

interface MentionItem {
  type: MentionRef["type"];
  id: string;
  label: string;
  subtitle?: string;
  icon: typeof FileText;
}

export function ChatMentionDropdown({
  scope,
  scopeId,
  query,
  onSelect,
  onClose,
}: ChatMentionDropdownProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const { data: documents } = useQuery<{ id: string; name: string }[]>({
    queryKey: ["chat-mention-documents", scopeId],
    queryFn: async () => {
      if (scope === "document") {
        const { data } = await apiClient.get(API_ROUTES.DOCUMENTS.ROOT);
        return data.map((d: any) => ({ id: d.id, name: d.originalName ?? d.name }));
      }
      const { data } = await apiClient.get(
        API_ROUTES.COLLECTIONS.MASTERY(scopeId),
      );
      const docs = data?.documents ?? [];
      return docs.map((d: any) => ({ id: d.id, name: d.originalName ?? d.name }));
    },
    staleTime: 60_000,
  });

  const { data: concepts } = useQuery<{ id: string; name: string }[]>({
    queryKey: ["chat-mention-concepts", scope, scopeId],
    queryFn: async () => {
      if (scope === "concept") {
        const { data } = await apiClient.get(
          API_ROUTES.GRAPH.TOPOLOGY,
        );
        const nodes = data?.nodes ?? [];
        return nodes.map((n: any) => ({ id: n.id, name: n.label }));
      }
      if (scope === "document") {
        const { data } = await apiClient.get(
          API_ROUTES.DOCUMENTS.SUMMARY(scopeId),
        );
        const nodes = data?.nodes ?? [];
        return nodes.map((n: any) => ({ id: n.id, name: n.label }));
      }
      const { data } = await apiClient.get(
        API_ROUTES.COLLECTIONS.MASTERY(scopeId),
      );
      const nodes = data?.nodes ?? [];
      return nodes.map((n: any) => ({ id: n.id, name: n.label }));
    },
    staleTime: 60_000,
  });

  const { data: sessions } = useChatSessions();

  const items: MentionItem[] = [];

  if (documents) {
    for (const doc of documents) {
      items.push({
        type: "document",
        id: doc.id,
        label: doc.name,
        icon: FileText,
      });
    }
  }

  if (concepts) {
    for (const c of concepts) {
      items.push({
        type: "concept",
        id: c.id,
        label: c.name,
        subtitle: "Concept",
        icon: Lightbulb,
      });
    }
  }

  if (sessions) {
    for (const s of sessions.slice(0, 10)) {
      items.push({
        type: "session",
        id: s.id,
        label: s.label,
        subtitle: s.documentName ?? undefined,
        icon: ClipboardList,
      });
    }
  }

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const el = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (filtered.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl p-3 text-sm text-zinc-400 w-80">
        No matches found
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl max-h-64 overflow-y-auto w-80"
    >
      {filtered.map((item, i) => {
        const Icon = item.icon;
        return (
          <button
            key={`${item.type}-${item.id}`}
            type="button"
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors",
              i === activeIndex
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-300 hover:bg-zinc-800/50",
            )}
            onMouseEnter={() => setActiveIndex(i)}
            onClick={() => {
              onSelect({
                type: item.type,
                id: item.id,
                label: item.label,
              });
              onClose();
            }}
          >
            <Icon className="h-4 w-4 shrink-0 text-zinc-500" />
            <div className="min-w-0">
              <div className="truncate font-medium">{item.label}</div>
              {item.subtitle && (
                <div className="truncate text-xs text-zinc-500">
                  {item.type === "session" ? item.subtitle : `@${item.type}`}
                </div>
              )}
            </div>
            <span className="ml-auto text-xs text-zinc-600 shrink-0">
              @{item.type}
            </span>
          </button>
        );
      })}
    </div>
  );
}
