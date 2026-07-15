"use client";

import { memo } from "react";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/lib/types/api";

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage = memo(function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-3",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser && (
        <div className="flex h-6 w-6 shrink-0 items-center justify-center border border-[var(--color-border-default)] bg-[var(--color-surface)]">
          <Bot className="h-3.5 w-3.5 text-[var(--color-accent-primary)]" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[80%] rounded-md border px-3 py-2 text-sm leading-relaxed",
          isUser
            ? "border-[var(--color-accent-primary)]/30 bg-[var(--color-accent-primary)]/10 text-[var(--color-text-primary)]"
            : "border-[var(--color-border-default)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]",
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>

      {isUser && (
        <div className="flex h-6 w-6 shrink-0 items-center justify-center border border-[var(--color-border-default)] bg-[var(--color-surface)]">
          <User className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
        </div>
      )}
    </div>
  );
});
