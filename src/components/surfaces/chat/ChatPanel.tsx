"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MessageSquare, Sparkles } from "lucide-react";
import { useChatMessages, useSendChatMessage, useChatTokenUsage } from "@/lib/hooks";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { TokenBar } from "./TokenBar";
import { Spinner } from "@/components/ui/Spinner";
import type { ChatMessage as ChatMessageType, ChatStreamChunk, ChatScope, MentionRef } from "@/lib/types/api";

interface ChatPanelProps {
  conversationId: string | null;
  scope?: ChatScope;
  scopeId?: string;
  title?: string;
  restricted?: boolean;
  onTokenUpdate?: (chunk: ChatStreamChunk) => void;
  onCreateConversation?: () => Promise<{ id: string; scope: ChatScope; scopeId: string; title: string } | null>;
  onSelectConversation?: (conversationId: string) => void;
}

export function ChatPanel({ conversationId, scope: propScope, scopeId: propScopeId, title: propTitle, restricted, onTokenUpdate, onCreateConversation, onSelectConversation }: ChatPanelProps) {
  const { data, isLoading } = useChatMessages(conversationId);

  const scope = data?.conversation.scope ?? propScope;
  const scopeId = data?.conversation.scopeId ?? propScopeId;
  const title = data?.conversation.title ?? propTitle;
  const { mutate: sendMessage, abort } = useSendChatMessage();
  const { data: tokenUsage } = useChatTokenUsage();

  const [streamingMessages, setStreamingMessages] = useState<ChatMessageType[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isBlocked = (tokenUsage?.remaining ?? 1) <= 0;

  const isNearBottom = useCallback(() => {
    if (!scrollRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    return scrollHeight - scrollTop - clientHeight < 120;
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: smooth ? "smooth" : "instant" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom(false);
  }, [conversationId, scrollToBottom]);

  useEffect(() => {
    if (isNearBottom()) {
      scrollToBottom(!isStreaming);
    }
  }, [data?.messages, streamingMessages, scrollToBottom, isStreaming, isNearBottom]);

  useEffect(() => {
    return () => abort();
  }, [abort]);

  const [creatingConversation, setCreatingConversation] = useState(false);

  const handleSend = useCallback(
    async (content: string, mentionRefs?: MentionRef[]) => {
      if (isStreaming) return;

      let convId = conversationId;
      let convScope = scope;
      let convScopeId = scopeId;

      if (!convId) {
        if (!onCreateConversation || creatingConversation) return;
        setCreatingConversation(true);
        try {
          const conv = await onCreateConversation();
          if (!conv) {
            setCreatingConversation(false);
            return;
          }
          convId = conv.id;
          convScope = conv.scope;
          convScopeId = conv.scopeId;
        } catch {
          setCreatingConversation(false);
          return;
        }
        setCreatingConversation(false);
      }

      if (!convId) return;

      const userMsg: ChatMessageType = {
        id: `temp-${Date.now()}`,
        conversationId: convId,
        role: "user",
        content,
        mentions: mentionRefs ?? null,
        citations: null,
        createdAt: new Date().toISOString(),
      };

      const assistantMsg: ChatMessageType = {
        id: `temp-assistant-${Date.now()}`,
        conversationId: convId,
        role: "assistant",
        content: "",
        mentions: null,
        citations: null,
        createdAt: new Date().toISOString(),
      };

      setStreamingMessages([userMsg, assistantMsg]);
      setIsStreaming(true);

      sendMessage(
        convId,
        content,
        (chunk: ChatStreamChunk) => {
          if (chunk.type === "token" && chunk.content) {
            setStreamingMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last && last.role === "assistant") {
                updated[updated.length - 1] = {
                  ...last,
                  content: last.content + chunk.content,
                };
              }
              return updated;
            });
          } else if (chunk.type === "done") {
            setIsStreaming(false);
            setStreamingMessages([]);
            onTokenUpdate?.(chunk);
          } else if (chunk.type === "error") {
            setIsStreaming(false);
            setStreamingMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last && last.role === "assistant") {
                updated[updated.length - 1] = {
                  ...last,
                  content: `Error: ${chunk.content ?? "Something went wrong"}`,
                };
              }
              return updated;
            });
          }
        },
        mentionRefs,
        restricted,
      );
    },
    [conversationId, scope, scopeId, isStreaming, sendMessage, onTokenUpdate, onCreateConversation, creatingConversation],
  );

  // No conversation — welcome state
  if (!conversationId) {
    return (
      <div className="flex flex-1 flex-col">
        <TokenBar className="shrink-0" />
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-32 text-center">
          <div className="mb-6 flex h-12 w-12 items-center justify-center border border-[var(--color-border-default)] bg-[var(--color-surface)]">
            <Sparkles className="h-6 w-6 text-[var(--color-accent-primary)]" />
          </div>
          <h1 className="mb-2 font-mono text-lg font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
            What would you like to know?
          </h1>
          <p className="max-w-md font-mono text-[11px] text-[var(--color-text-muted)]">
            Chat about your study material, attach documents or quiz sessions for context
          </p>
        </div>

        <ChatInput
          onSend={handleSend}
          onSelectConversation={onSelectConversation}
          disabled={isStreaming || creatingConversation}
          blocked={isBlocked}
          placeholder="Ask anything..."
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col">
        <TokenBar className="shrink-0" />
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      </div>
    );
  }

  const messages = [...(data?.messages ?? []), ...streamingMessages];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      {title && (
        <div className="shrink-0 border-b border-[var(--color-border-default)] px-4 py-3">
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
            {title}
          </p>
          {scope && (
            <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
              {scope}
            </p>
          )}
        </div>
      )}

      <TokenBar className="shrink-0" />

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <MessageSquare className="h-8 w-8 text-[var(--color-text-muted)]" />
            <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
              Start a conversation
            </p>
          </div>
        ) : (
          <div className="py-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        onSelectConversation={onSelectConversation}
        disabled={isStreaming}
        blocked={isBlocked}
      />
    </div>
  );
}
