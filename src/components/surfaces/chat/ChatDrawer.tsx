"use client";

import { useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, Minimize2, X } from "lucide-react";
import { useChatStore, getScopeKey } from "@/store/chat.store";
import { useCreateConversation } from "@/lib/hooks";
import { ChatPanel } from "./ChatPanel";
import { Button } from "@/components/ui/button";

export function ChatDrawer() {
  const pathname = usePathname();
  const { chatDrawer, closeChatDrawer, setChatDrawerWidth, getActiveConversation, setActiveConversation } = useChatStore();
  const { isOpen, width, scope, scopeId, pageLabel } = chatDrawer;

  const scopeKey = getScopeKey(scope, scopeId);
  const conversationId = getActiveConversation(scopeKey);

  const createConversation = useCreateConversation();

  const isSessionPage = pathname?.startsWith("/session") ?? false;
  const drawerWidth = width === "expanded" ? 600 : 420;

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeChatDrawer();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, closeChatDrawer]);

  const handleCreateConversation = useCallback(async () => {
    const conv = await createConversation.mutateAsync({
      scope,
      scopeId: scopeId ?? undefined,
    });
    setActiveConversation(scopeKey, conv.id);
    return conv;
  }, [createConversation, scope, scopeId, scopeKey, setActiveConversation]);

  const handleSelectConversation = useCallback((convId: string) => {
    setActiveConversation(scopeKey, convId);
  }, [scopeKey, setActiveConversation]);

  const toggleWidth = useCallback(() => {
    setChatDrawerWidth(width === "expanded" ? "normal" : "expanded");
  }, [width, setChatDrawerWidth]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={closeChatDrawer}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 flex flex-col border-l border-[var(--color-border-default)] bg-[var(--color-canvas)]"
            style={{ width: drawerWidth }}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-border-default)] px-4 py-3">
              <div className="flex flex-col">
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                  CHAT
                </p>
                {pageLabel && (
                  <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--color-text-muted)]">
                    {pageLabel}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleWidth}
                  className="h-6 w-6"
                  title={width === "normal" ? "Expand" : "Collapse"}
                >
                  {width === "normal" ? (
                    <Maximize2 className="h-3 w-3" />
                  ) : (
                    <Minimize2 className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeChatDrawer}
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
              scopeId={scopeId ?? undefined}
              onSelectConversation={handleSelectConversation}
              onCreateConversation={handleCreateConversation}
              restricted={isSessionPage}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
