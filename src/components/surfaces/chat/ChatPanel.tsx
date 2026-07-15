"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MessageSquare } from "lucide-react";
import { useChatMessages, useSendChatMessage, useChatTokenUsage } from "@/lib/hooks";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { TokenBar } from "./TokenBar";
import { Spinner } from "@/components/ui/Spinner";
import type { ChatMessage as ChatMessageType, ChatStreamChunk } from "@/lib/types/api";

interface ChatPanelProps {
  conversationId: string | null;
  onTokenUpdate?: (chunk: ChatStreamChunk) => void;
}

export function ChatPanel({ conversationId, onTokenUpdate }: ChatPanelProps) {
  const { data, isLoading } = useChatMessages(conversationId);
  const { mutate: sendMessage, abort } = useSendChatMessage();
  const { data: tokenUsage } = useChatTokenUsage();

  const [streamingMessages, setStreamingMessages] = useState<ChatMessageType[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isBlocked = (tokenUsage?.remaining ?? 1) <= 0;

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [data?.messages, streamingMessages, scrollToBottom]);

  useEffect(() => {
    return () => abort();
  }, [abort]);

  const handleSend = useCallback(
    (content: string) => {
      if (!conversationId || isStreaming) return;

      const userMsg: ChatMessageType = {
        id: `temp-${Date.now()}`,
        conversationId,
        role: "user",
        content,
        createdAt: new Date().toISOString(),
      };

      const assistantMsg: ChatMessageType = {
        id: `temp-assistant-${Date.now()}`,
        conversationId,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
      };

      setStreamingMessages([userMsg, assistantMsg]);
      setIsStreaming(true);

      sendMessage(conversationId, content, (chunk: ChatStreamChunk) => {
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
      });
    },
    [conversationId, isStreaming, sendMessage, onTokenUpdate],
  );

  if (!conversationId) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <MessageSquare className="h-8 w-8 text-[var(--color-text-muted)]" />
        <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
          Select a conversation or start a new one
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const messages = [...(data?.messages ?? []), ...streamingMessages];

  return (
    <div className="flex h-full flex-col">
      <TokenBar />

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

      <ChatInput
        onSend={handleSend}
        disabled={isStreaming}
        blocked={isBlocked}
      />
    </div>
  );
}
