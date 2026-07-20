"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type KeyboardEvent,
} from "react";
import { Send, Loader2, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChatContextPicker } from "./ChatContextPicker";
import type { MentionRef } from "@/lib/types/api";

interface ChatInputProps {
  onSend: (content: string, mentions?: MentionRef[]) => void;
  disabled?: boolean;
  blocked?: boolean;
  placeholder?: string;
}

const CONTEXT_ICONS = {
  document: "DOC",
  session: "SES",
  concept: "CON",
} as const;

export function ChatInput({
  onSend,
  disabled = false,
  blocked = false,
  placeholder = "What would you like to know?",
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const [mentions, setMentions] = useState<MentionRef[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const removeMention = useCallback((mentionId: string) => {
    setMentions((prev) => prev.filter((m) => m.id !== mentionId));
  }, []);

  const handleAttach = useCallback((items: MentionRef[]) => {
    setMentions((prev) => {
      const existing = new Set(prev.map((m) => `${m.type}:${m.id}`));
      const newItems = items.filter(
        (item) => !existing.has(`${item.type}:${item.id}`),
      );
      return [...prev, ...newItems];
    });
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled || blocked) return;
    onSend(trimmed, mentions.length > 0 ? mentions : undefined);
    setValue("");
    setMentions([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, disabled, blocked, onSend, mentions]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setValue(val);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="border-t border-[var(--color-border-default)] bg-[var(--color-canvas)] p-3">
      {/* Context chips */}
      {mentions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {mentions.map((m) => (
            <span
              key={m.id}
              className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] px-2 py-0.5 text-xs text-[var(--color-text-secondary)]"
            >
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--color-accent-primary)]">
                {CONTEXT_ICONS[m.type]}
              </span>
              <span className="font-medium">{m.label}</span>
              <button
                type="button"
                onClick={() => removeMention(m.id)}
                className="ml-0.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative flex items-start gap-2">
        {/* Context picker trigger */}
        <div className="relative">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => setPickerOpen(!pickerOpen)}
            className="shrink-0 border border-[var(--color-border-default)]"
          >
            <Plus className="h-4 w-4" />
          </Button>

          <ChatContextPicker
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            onAttach={handleAttach}
          />
        </div>

        {/* Textarea */}
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={blocked ? "Monthly token limit reached" : placeholder}
            disabled={disabled || blocked}
            rows={1}
            className={cn(
              "w-full resize-none border border-[var(--color-border-default)] bg-[var(--color-surface)] px-3 py-2 min-h-10 font-mono text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus-visible:outline-none focus-visible:border-[var(--color-accent-primary)] disabled:cursor-not-allowed disabled:opacity-40",
              blocked && "border-[var(--color-destructive)]/50",
            )}
          />
        </div>

        <Button
          size="icon"
          variant="default"
          onClick={handleSend}
          disabled={!value.trim() || disabled || blocked}
          className="shrink-0"
        >
          {disabled ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
