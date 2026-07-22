"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { MessageSquare, X, Maximize2, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateConversation, useChatConversations } from "@/lib/hooks";
import { useChatStore, getScopeKey } from "@/store/chat.store";
import { ChatPanel } from "./ChatPanel";
import { Button } from "@/components/ui/button";
import type { ChatScope } from "@/lib/types/api";

type PanelSize = "normal" | "expanded";

const SIZE_CONFIG = {
  normal: { width: 420, height: "70vh" },
  expanded: { width: 600, height: "85vh" },
} as const;

const MIN_WIDTH = 360;
const MAX_WIDTH = 700;

interface ChatFABProps {
  scope?: ChatScope;
  scopeId?: string;
  restricted?: boolean;
}

export function ChatFAB({ scope = "general", scopeId, restricted }: ChatFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [panelSize, setPanelSize] = useState<PanelSize>("normal");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const scopeKey = getScopeKey(scope, scopeId);
  const activeConversationIds = useChatStore((s) => s.activeConversationIds);
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);

  const createConversation = useCreateConversation();
  const { data: conversations } = useChatConversations(scope);

  const panelRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const resizeStartRef = useRef({ x: 0, width: 0 });

  const currentConfig = SIZE_CONFIG[panelSize];

  // Restore persisted conversation on mount or scope change
  useEffect(() => {
    if (isOpen) return;
    const persistedId = activeConversationIds[scopeKey];
    if (persistedId && !conversationId) {
      setConversationId(persistedId);
    }
  }, [isOpen, scopeKey, activeConversationIds, conversationId]);

  // Find existing conversation from server for this scope
  useEffect(() => {
    if (conversationId || !conversations) return;
    const existing = conversations.find(
      (c) => c.scope === scope && (!scopeId || c.scopeId === scopeId),
    );
    if (existing) {
      setConversationId(existing.id);
      setActiveConversation(scopeKey, existing.id);
    }
  }, [conversations, scope, scopeId, conversationId, scopeKey, setActiveConversation]);

  const handleOpen = async () => {
    if (!conversationId) {
      const conv = await createConversation.mutateAsync({
        scope,
        scopeId,
      });
      setConversationId(conv.id);
      setActiveConversation(scopeKey, conv.id);
    }
    setIsOpen(true);
  };

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleSelectConversation = useCallback((convId: string) => {
    setConversationId(convId);
    setActiveConversation(scopeKey, convId);
  }, [scopeKey, setActiveConversation]);

  const toggleSize = useCallback(() => {
    setPanelSize((prev) => (prev === "normal" ? "expanded" : "normal"));
  }, []);

  // Drag handlers
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        posX: position.x,
        posY: position.y,
      };
    },
    [position],
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPosition({
        x: dragStartRef.current.posX + dx,
        y: dragStartRef.current.posY + dy,
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Resize handlers
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      resizeStartRef.current = {
        x: e.clientX,
        width: currentConfig.width,
      };
    },
    [currentConfig.width],
  );

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = resizeStartRef.current.x - e.clientX;
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, resizeStartRef.current.width + dx));
      if (newWidth >= 550 && panelSize === "normal") {
        setPanelSize("expanded");
      } else if (newWidth < 550 && panelSize === "expanded") {
        setPanelSize("normal");
      }
    };

    const handleMouseUp = () => setIsResizing(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, panelSize]);

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
            ref={panelRef}
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed z-50 flex flex-col overflow-hidden border border-[var(--color-border-default)] bg-[var(--color-canvas)] shadow-2xl"
            style={{
              bottom: `${24 - position.y}px`,
              right: `${24 + position.x}px`,
              width: `${currentConfig.width}px`,
              height: currentConfig.height,
            }}
          >
            {/* Header — draggable */}
            <div
              onMouseDown={handleDragStart}
              className="flex shrink-0 items-center justify-between border-b border-[var(--color-border-default)] px-4 py-3 cursor-grab active:cursor-grabbing select-none"
            >
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                CHAT
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSize}
                  className="h-6 w-6"
                  title={panelSize === "normal" ? "Expand" : "Collapse"}
                >
                  {panelSize === "normal" ? (
                    <Maximize2 className="h-3 w-3" />
                  ) : (
                    <Minimize2 className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="h-6 w-6"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Chat content */}
            <ChatPanel
              conversationId={conversationId}
              scope={scope}
              scopeId={scopeId}
              onSelectConversation={handleSelectConversation}
              restricted={restricted}
            />

            {/* Resize handle — left edge */}
            <div
              onMouseDown={handleResizeStart}
              className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-[var(--color-accent-primary)]/30 transition-colors"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
