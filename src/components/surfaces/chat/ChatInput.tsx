"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type KeyboardEvent,
} from "react";
import { Send, Loader2, X, Plus, Clock, FileText, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChatContextPicker } from "./ChatContextPicker";
import { useChatConversations, useDeleteConversation } from "@/lib/hooks";
import { useChatStore } from "@/store/chat.store";
import type { MentionRef, ChatConversation } from "@/lib/types/api";

interface ChatInputProps {
  onSend: (content: string, mentions?: MentionRef[]) => void;
  onSelectConversation?: (conversationId: string) => void;
  disabled?: boolean;
  blocked?: boolean;
  placeholder?: string;
}

const CONTEXT_ICONS = {
  document: "DOC",
  session: "SES",
  concept: "CON",
} as const;

const SLASH_COMMANDS = [
  { command: "@/h", label: "History", description: "Browse past conversations" },
  { command: "@/history", label: "History", description: "Browse past conversations" },
] as const;

function formatRelativeTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "JUST NOW";
  if (diffMins < 60) return `${diffMins}M AGO`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}H AGO`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}D AGO`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
}

export function ChatInput({
  onSend,
  onSelectConversation,
  disabled = false,
  blocked = false,
  placeholder = "What would you like to know?",
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const [mentions, setMentions] = useState<MentionRef[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  const { data: conversations } = useChatConversations();
  const deleteConversation = useDeleteConversation();

  const isSlashCommand = value.trim().startsWith("@/");
  const slashArg = value.trim().slice(2).toLowerCase();

  // Filter conversations for history
  const filteredConversations = (conversations ?? []).filter((conv) => {
    if (!historyFilter) return true;
    return conv.title.toLowerCase().includes(historyFilter.toLowerCase());
  });

  // Detect slash command
  useEffect(() => {
    if (isSlashCommand && (slashArg === "h" || slashArg.startsWith("history"))) {
      setHistoryOpen(true);
    } else {
      setHistoryOpen(false);
    }
  }, [value, isSlashCommand, slashArg]);

  // Close history on click outside
  useEffect(() => {
    if (!historyOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
        setHistoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [historyOpen]);

  // Consume pending mentions from chat store (e.g., from "Ask AI" on mastery page)
  const consumePendingMentions = useChatStore((s) => s.consumePendingMentions);
  useEffect(() => {
    const pending = consumePendingMentions();
    if (pending.length > 0) {
      setMentions((prev) => {
        const existing = new Set(prev.map((m) => `${m.type}:${m.id}`));
        const newItems = pending.filter(
          (item) => !existing.has(`${item.type}:${item.id}`),
        );
        return [...prev, ...newItems];
      });
    }
  }, [consumePendingMentions]);

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

  const handleSelectConversation = useCallback(
    (conv: ChatConversation) => {
      onSelectConversation?.(conv.id);
      setValue("");
      setHistoryOpen(false);
      setHistoryFilter("");
    },
    [onSelectConversation],
  );

  const handleDeleteConversation = useCallback(
    (e: React.MouseEvent, conversationId: string) => {
      e.stopPropagation();
      deleteConversation.mutate(conversationId);
    },
    [deleteConversation],
  );

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled || blocked) return;

    // Don't send slash commands as messages
    if (trimmed.startsWith("@/")) return;

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
    if (e.key === "Escape" && historyOpen) {
      setHistoryOpen(false);
      setValue("");
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
    <div className="relative border-t border-[var(--color-border-default)] bg-[var(--color-canvas)] p-3">
      {/* History dropdown */}
      <AnimatePresence>
        {historyOpen && (
          <motion.div
            ref={historyRef}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-3 right-3 z-50 mb-2 max-h-64 overflow-hidden rounded-md border border-[var(--color-border-default)] bg-[var(--color-surface)] shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-[var(--color-border-default)] px-3 py-2">
              <Clock className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
              <p className="kl-data-label">CONVERSATION HISTORY</p>
            </div>

            {/* Filter input */}
            <div className="border-b border-[var(--color-border-subtle)] px-3 py-1.5">
              <input
                type="text"
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value)}
                placeholder="Filter conversations..."
                className="w-full bg-transparent font-mono text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none"
                autoFocus
              />
            </div>

            {/* Conversation list */}
            <div className="max-h-48 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="px-3 py-6 text-center">
                  <p className="font-mono text-[10px] text-[var(--color-text-muted)]">
                    No conversations yet
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => handleSelectConversation(conv)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-[var(--color-surface-elevated)] group"
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0 text-[var(--color-text-muted)]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]">
                        {conv.title}
                      </p>
                      <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--color-text-muted)]">
                        {conv.scope} — {formatRelativeTime(conv.updatedAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteConversation(e, conv.id)}
                      className="shrink-0 p-1 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              isSlashCommand && "border-[var(--color-accent-primary)]",
            )}
          />
        </div>

        <Button
          size="icon"
          variant="default"
          onClick={handleSend}
          disabled={!value.trim() || disabled || blocked || isSlashCommand}
          className="shrink-0"
        >
          {disabled ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Slash command hint */}
      <AnimatePresence>
        {isSlashCommand && !historyOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-1.5 font-mono text-[10px] text-[var(--color-text-muted)]"
          >
            Type <span className="text-[var(--color-accent-primary)]">@/h</span> for conversation history
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
