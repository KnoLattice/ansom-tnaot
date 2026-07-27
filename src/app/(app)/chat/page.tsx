"use client";

import { useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PanelLeftOpen } from "lucide-react";
import { useCreateConversation, useChatConversations } from "@/lib/hooks";
import { ChatPanel } from "@/components/surfaces/chat/ChatPanel";
import { ChatHistoryDrawer } from "@/components/surfaces/chat/ChatHistoryDrawer";
import type { ChatConversation } from "@/lib/types/api";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationId = searchParams.get("conversation");

  const { data: conversations } = useChatConversations();
  const createConversation = useCreateConversation();

  const activeConversation = (conversations ?? []).find(
    (c) => c.id === conversationId,
  ) ?? null;

  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSelectConversation = useCallback(
    (conv: ChatConversation) => {
      setDrawerOpen(false);
      router.push(`/chat?conversation=${conv.id}`);
    },
    [router],
  );

  const handleNewChat = useCallback(() => {
    setDrawerOpen(false);
    router.push("/chat");
  }, [router]);

  const handleConversationNotFound = useCallback(() => {
    router.replace("/chat");
  }, [router]);

  const handleCreateConversation = useCallback(async () => {
    const conv = await createConversation.mutateAsync({
      scope: "general",
    });
    router.push(`/chat?conversation=${conv.id}`);
    return conv;
  }, [createConversation, router]);

  return (
    <div className="-mx-4 -mt-16 flex h-[calc(100dvh-3rem)] flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex shrink-0 items-center gap-3 border-b border-[var(--color-border-default)] px-4 py-2.5">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] transition hover:text-[var(--color-text-secondary)]"
        >
          <PanelLeftOpen className="h-4 w-4" />
          History
        </button>

        {activeConversation && (
          <span className="truncate font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
            {activeConversation.title}
          </span>
        )}
      </div>

      {/* Drawer */}
      <ChatHistoryDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeConversationId={activeConversation?.id ?? null}
        onSelect={handleSelectConversation}
        onNewChat={handleNewChat}
      />

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <ChatPanel
          conversationId={conversationId}
          onCreateConversation={
            !conversationId ? handleCreateConversation : undefined
          }
          onConversationNotFound={conversationId ? handleConversationNotFound : undefined}
        />
      </div>
    </div>
  );
}
