"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCreateConversation, useSendChatMessage, useChatTokenUsage } from "@/lib/hooks";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { TokenBar } from "./TokenBar";
import type { ChatMessage as ChatMessageType, ChatStreamChunk, ChatConversation } from "@/lib/types/api";

interface HomeChatBarProps {
  documents?: { id: string; originalName: string; processingStatus: string }[];
}

export function HomeChatBar({ documents = [] }: HomeChatBarProps) {
  const router = useRouter();
  const createConversation = useCreateConversation();
  const { mutate: sendMessage, abort } = useSendChatMessage();
  const { data: tokenUsage } = useChatTokenUsage();

  const [isExpanded, setIsExpanded] = useState(false);
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isBlocked = (tokenUsage?.remaining ?? 1) <= 0;

  const completedDocs = documents.filter(
    (d) => d.processingStatus === "completed",
  );

  const handleSend = useCallback(
    async (content: string) => {
      let conv = conversation;

      if (!conv) {
        if (completedDocs.length === 0) return;
        conv = await createConversation.mutateAsync({
          scope: "document",
          scopeId: completedDocs[0].id,
        });
        setConversation(conv);
      }

      const userMsg: ChatMessageType = {
        id: `temp-${Date.now()}`,
        conversationId: conv.id,
        role: "user",
        content,
        mentions: null,
        citations: null,
        createdAt: new Date().toISOString(),
      };

      const assistantMsg: ChatMessageType = {
        id: `temp-assistant-${Date.now()}`,
        conversationId: conv.id,
        role: "assistant",
        content: "",
        mentions: null,
        citations: null,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      sendMessage(conv.id, content, (chunk: ChatStreamChunk) => {
        if (chunk.type === "token" && chunk.content) {
          setMessages((prev) => {
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
        } else if (chunk.type === "done" || chunk.type === "error") {
          setIsStreaming(false);
        }
      });
    },
    [conversation, completedDocs, createConversation, sendMessage],
  );

  useEffect(() => {
    if (isExpanded) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isExpanded]);

  if (completedDocs.length === 0) return null;

  return (
    <div className="border border-[var(--color-border-default)] bg-[var(--color-surface)]">
      {/* Compact bar */}
      {!isExpanded && (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-[var(--color-surface-elevated)]"
        >
          <MessageSquare className="h-4 w-4 shrink-0 text-[var(--color-accent-primary)]" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
            Ask about a document or concept...
          </span>
        </button>
      )}

      {/* Expanded chat */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-border-default)] px-4 py-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-[var(--color-accent-primary)]" />
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                  Quick Chat
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push("/chat")}
                  className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[var(--color-accent-primary)] transition hover:brightness-110"
                >
                  FULL VIEW
                  <ArrowUpRight className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsExpanded(false);
                    abort();
                  }}
                  className="p-1 text-[var(--color-text-muted)] transition hover:text-[var(--color-text-primary)]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <TokenBar compact />

            {/* Messages */}
            <div
              ref={scrollRef}
              className="max-h-[40vh] overflow-y-auto"
            >
              {messages.length === 0 ? (
                <p className="py-6 text-center font-mono text-[10px] text-[var(--color-text-muted)]">
                  Ask anything about your study material
                </p>
              ) : (
                messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
              )}
            </div>

            <ChatInput
              onSend={handleSend}
              disabled={isStreaming}
              blocked={isBlocked}
              placeholder={`Ask about ${completedDocs[0]?.originalName?.replace(/\.[^.]+$/, "") ?? "your document"}...`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
