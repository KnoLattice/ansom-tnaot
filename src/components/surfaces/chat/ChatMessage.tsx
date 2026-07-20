"use client";

import { memo, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, User, FileText, Lightbulb, ClipboardList, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType, MentionRef, CitationRef } from "@/lib/types/api";

interface ChatMessageProps {
  message: ChatMessageType;
}

const MENTION_ICONS = {
  document: FileText,
  concept: Lightbulb,
  session: ClipboardList,
} as const;

function MentionBadge({ mention }: { mention: MentionRef }) {
  const Icon = MENTION_ICONS[mention.type];
  return (
    <span className="inline-flex items-center gap-1 rounded border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-muted)] mr-1 mb-0.5">
      <Icon className="h-2.5 w-2.5" />
      <span className="text-[var(--color-text-muted)]">@{mention.type}</span>
      <span className="font-medium text-[var(--color-text-secondary)]">{mention.label}</span>
    </span>
  );
}

function CitationBadge({ citation }: { citation: CitationRef }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <span className="relative inline-block mr-1 mb-0.5 align-middle">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium transition-colors",
          expanded
            ? "border-[var(--color-accent-primary)]/50 bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]"
            : "border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] hover:border-[var(--color-border-default)] hover:text-[var(--color-text-secondary)]",
        )}
      >
        <BookOpen className="h-2.5 w-2.5" />
        <span>{citation.title}</span>
        {expanded ? (
          <ChevronUp className="h-2.5 w-2.5" />
        ) : (
          <ChevronDown className="h-2.5 w-2.5" />
        )}
      </button>

      <AnimatePresence>
        {expanded && citation.sourceSnippets && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 z-50 mb-1 w-72 overflow-hidden rounded-md border border-[var(--color-border-default)] bg-[var(--color-surface)] shadow-lg"
          >
            <div className="border-b border-[var(--color-border-default)] px-3 py-1.5">
              <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                Source Excerpt
              </p>
            </div>
            <div className="max-h-32 overflow-y-auto px-3 py-2">
              <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
                {citation.sourceSnippets}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

interface ContentSegment {
  type: "text" | "citation";
  content?: string;
  citation?: CitationRef;
}

function splitContentWithCitations(
  content: string,
  citations: CitationRef[] | null,
): ContentSegment[] {
  if (!citations || citations.length === 0) {
    return [{ type: "text", content }];
  }

  const citationMap = new Map(citations.map((c) => [c.nodeId, c]));
  const segments: ContentSegment[] = [];
  const regex = /\[NODE:([^\]]+)\]/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        content: content.slice(lastIndex, match.index),
      });
    }

    const nodeId = match[1];
    const citation = citationMap.get(nodeId);
    if (citation) {
      segments.push({ type: "citation", citation });
    } else {
      segments.push({ type: "text", content: `[${match[0]}]` });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    segments.push({
      type: "text",
      content: content.slice(lastIndex),
    });
  }

  return segments;
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="kl-chat-prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

export const ChatMessage = memo(function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  const segments = useMemo(
    () => splitContentWithCitations(message.content, message.citations),
    [message.content, message.citations],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
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
        {isUser && message.mentions && message.mentions.length > 0 && (
          <div className="flex flex-wrap mb-1.5">
            {message.mentions.map((m) => (
              <MentionBadge key={m.id} mention={m} />
            ))}
          </div>
        )}

        {segments.map((seg, i) =>
          seg.type === "citation" && seg.citation ? (
            <CitationBadge key={`cit-${i}`} citation={seg.citation} />
          ) : (
            <MarkdownContent key={`text-${i}`} content={seg.content ?? ""} />
          ),
        )}
      </div>

      {isUser && (
        <div className="flex h-6 w-6 shrink-0 items-center justify-center border border-[var(--color-border-default)] bg-[var(--color-surface)]">
          <User className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
        </div>
      )}
    </motion.div>
  );
});
