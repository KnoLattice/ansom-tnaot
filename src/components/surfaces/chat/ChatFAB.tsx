"use client";

import { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateConversation } from "@/lib/hooks";
import { ChatPanel } from "./ChatPanel";
import { Button } from "@/components/ui/button";

interface ChatFABProps {
  scope: "document" | "collection";
  scopeId: string;
}

export function ChatFAB({ scope, scopeId }: ChatFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const createConversation = useCreateConversation();

  const handleOpen = async () => {
    if (!conversationId) {
      const conv = await createConversation.mutateAsync({ scope, scopeId });
      setConversationId(conv.id);
    }
    setIsOpen(true);
  };

  return (
    <>
      {/* FAB Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            type="button"
            onClick={handleOpen}
            className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)] text-white shadow-lg transition hover:brightness-110"
          >
            <MessageSquare className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 flex h-[70vh] w-[420px] flex-col overflow-hidden border border-[var(--color-border-default)] bg-[var(--color-canvas)] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-border-default)] px-4 py-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                CHAT — {scope}
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            <ChatPanel conversationId={conversationId} scope={scope} scopeId={scopeId} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
