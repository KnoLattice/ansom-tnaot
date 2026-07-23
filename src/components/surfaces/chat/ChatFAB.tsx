"use client";

import { useCallback } from "react";
import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useChatStore } from "@/store/chat.store";
import type { ChatScope } from "@/lib/types/api";

interface ChatFABProps {
  scope?: ChatScope;
  scopeId?: string;
  restricted?: boolean;
  pageLabel?: string;
}

export function ChatFAB({ scope = "general", scopeId, pageLabel }: ChatFABProps) {
  const { chatDrawer, openChatDrawer, closeChatDrawer } = useChatStore();
  const isOpen = chatDrawer.isOpen;

  const handleClick = useCallback(() => {
    if (isOpen) {
      closeChatDrawer();
    } else {
      openChatDrawer(scope, scopeId ?? null, pageLabel);
    }
  }, [isOpen, scope, scopeId, pageLabel, openChatDrawer, closeChatDrawer]);

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      type="button"
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)] text-white shadow-lg transition hover:brightness-110"
    >
      <MessageSquare className="h-5 w-5" />
    </motion.button>
  );
}
