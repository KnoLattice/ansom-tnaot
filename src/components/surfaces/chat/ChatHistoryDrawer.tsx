"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";
import { ChatHistorySidebar } from "./ChatHistorySidebar";
import type { ChatConversation } from "@/lib/types/api";

interface ChatHistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  activeConversationId: string | null;
  onSelect: (conversation: ChatConversation) => void;
  onNewChat: () => void;
}

export function ChatHistoryDrawer({
  open,
  onClose,
  activeConversationId,
  onSelect,
  onNewChat,
}: ChatHistoryDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 flex w-[300px] flex-col border-r border-[var(--color-border-default)] bg-[var(--color-canvas)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-border-default)] px-3 py-3">
              <p className="kl-data-label">History</p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    onNewChat();
                    onClose();
                  }}
                  className="flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent-primary)] transition hover:brightness-110"
                >
                  <Plus className="h-3 w-3" />
                  New Chat
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 text-[var(--color-text-muted)] transition hover:text-[var(--color-text-primary)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Sidebar content */}
            <ChatHistorySidebar
              activeConversationId={activeConversationId}
              onSelect={(conv) => {
                onSelect(conv);
                onClose();
              }}
              className="flex-1 border-r-0"
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
