"use client";

import { useState, useCallback } from "react";
import { useDocuments, useCollections, useCreateConversation } from "@/lib/hooks";
import { ChatHistorySidebar } from "@/components/surfaces/chat/ChatHistorySidebar";
import { ChatPanel } from "@/components/surfaces/chat/ChatPanel";
import { ChatScopeSelector } from "@/components/surfaces/chat/ChatScopeSelector";
import { TokenBar } from "@/components/surfaces/chat/TokenBar";
import type { ChatConversation, ChatScope } from "@/lib/types/api";

export default function ChatPage() {
  const { documents } = useDocuments();
  const collections = useCollections();
  const createConversation = useCreateConversation();

  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);

  const collectionList = collections.collections ?? [];

  const handleSelectConversation = useCallback((conv: ChatConversation) => {
    setActiveConversation(conv);
  }, []);

  const handleScopeSelect = useCallback(
    async (scope: ChatScope, scopeId: string) => {
      const conv = await createConversation.mutateAsync({ scope, scopeId });
      setActiveConversation(conv);
    },
    [createConversation],
  );

  return (
    <div className="flex h-[calc(100vh-5rem)] border border-[var(--color-border-default)] bg-[var(--color-canvas)]">
      {/* Sidebar */}
      <ChatHistorySidebar
        activeConversationId={activeConversation?.id ?? null}
        onSelect={handleSelectConversation}
        className="w-[260px] shrink-0"
      />

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {activeConversation ? (
          <>
            <div className="border-b border-[var(--color-border-default)] px-4 py-3">
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                {activeConversation.title}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                {activeConversation.scope}
              </p>
            </div>
            <ChatPanel conversationId={activeConversation.id} />
          </>
        ) : (
          <div className="flex flex-1 flex-col">
            <TokenBar />
            <ChatScopeSelector
              onSelect={handleScopeSelect}
              documents={documents.filter((d) => d.processingStatus === "completed")}
              collections={collectionList}
            />
          </div>
        )}
      </div>
    </div>
  );
}
