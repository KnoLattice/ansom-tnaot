"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useCreateConversation } from "@/lib/hooks";
import { ChatPanel } from "./ChatPanel";
import { Button } from "@/components/ui/button";

interface ConceptChatPanelProps {
  nodeId: string;
  nodeTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ConceptChatPanel({
  nodeId,
  nodeTitle,
  isOpen,
  onClose,
}: ConceptChatPanelProps) {
  const createConversation = useCreateConversation();
  const conversationIdRef = useRef<string | null>(null);
  const prevNodeIdRef = useRef<string | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      mountedRef.current = false;
      return;
    }

    if (prevNodeIdRef.current !== nodeId) {
      conversationIdRef.current = null;
      prevNodeIdRef.current = nodeId;
    }

    if (!mountedRef.current && isOpen) {
      mountedRef.current = true;
      createConversation
        .mutateAsync({ scope: "concept", scopeId: nodeId })
        .then((conv) => {
          conversationIdRef.current = conv.id;
        })
        .catch(() => {});
    }
  }, [isOpen, nodeId, createConversation]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-[480px] flex-col border-l border-[var(--color-border-default)] bg-[var(--color-canvas)]"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border-default)] px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="kl-data-label">ASK AI</p>
                <p className="mt-0.5 truncate font-mono text-[10px] text-[var(--color-text-secondary)]">
                  {nodeTitle}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <ChatPanel conversationId={conversationIdRef.current} scope="concept" scopeId={nodeId} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
