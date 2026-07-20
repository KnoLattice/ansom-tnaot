"use client";

import { memo, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Text } from "mdast";
import { visit } from "unist-util-visit";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, User, FileText, Lightbulb, ClipboardList, BookOpen } from "lucide-react";
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
  const router = useRouter();
  const docId = citation.documentId ?? citation.nodeId;

  return (
    <button
      type="button"
      onClick={() => router.push(`/mastery/${docId}?node=${citation.nodeId}`)}
      title={citation.sourceSnippets ?? citation.title}
      className="inline-flex items-center gap-1 rounded border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]"
    >
      <BookOpen className="h-2.5 w-2.5" />
      <span>{citation.title}</span>
    </button>
  );
}

function remarkCitationPlugin(citations: CitationRef[]) {
  const citationMap = new Map(citations.map((c) => [c.nodeId, c]));

  return function attacher() {
    return (tree: any) => {
      visit(tree, 'text', (node: Text, index: any, parent: any) => {
        if (parent === null || index === null) return;

        const parts = node.value.split(/(\[NODE:[^\]]+\])/g);
        if (parts.length <= 1) return;

        const children = parts.map((part: string) => {
          const match = part.match(/\[NODE:([^\]]+)\]/);
          if (match) {
            const citation = citationMap.get(match[1]);
            if (citation) {
              return {
                type: 'link',
                url: `citation:${match[1]}`,
                title: citation.sourceSnippets ?? undefined,
                children: [{ type: 'text', value: citation.title }],
              } as any;
            }
            return { type: 'text', value: part } as Text;
          }
          return { type: 'text', value: part } as Text;
        });

        parent.children.splice(index, 1, ...children);
      });
    };
  };
}

export const ChatMessage = memo(function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  const citationList = message.citations ?? [];
  const citationMap = useMemo(() => {
    return new Map(citationList.map((c) => [c.nodeId, c]));
  }, [citationList]);

  const components = useMemo(() => ({
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => {
      if (href?.startsWith('citation:')) {
        const nodeId = href.slice('citation:'.length);
        const citation = citationMap.get(nodeId);
        if (citation) {
          return <CitationBadge citation={citation} />;
        }
        return <span className="text-[var(--color-text-muted)] text-[10px]">[NODE:{nodeId}]</span>;
      }
      return <a href={href}>{children}</a>;
    },
  } as any), [citationMap]);

  const plugins = useMemo(() => {
    if (citationList.length === 0) return [remarkGfm];
    return [remarkGfm, remarkCitationPlugin(citationList)];
  }, [citationList]);

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

        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <div className="kl-chat-prose">
            <ReactMarkdown
              remarkPlugins={plugins}
              components={components}
            >
              {message.content}
            </ReactMarkdown>
          </div>
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
