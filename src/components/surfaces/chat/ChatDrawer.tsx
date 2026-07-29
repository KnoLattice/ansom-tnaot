"use client";

import { useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Maximize2, Minimize2, X } from "lucide-react";
import { useChatStore, getScopeKey } from "@/store/chat.store";
import { useCreateConversation } from "@/lib/hooks";
import { ChatPanel } from "./ChatPanel";
import { Button } from "@/components/ui/button";

export function ChatDrawer() {
  const pathname = usePathname();

  // Subscribe only to the pieces of state we need
  const chatDrawer = useChatStore((state) => state.chatDrawer);
  const closeChatDrawer = useChatStore((state) => state.closeChatDrawer);
  const setChatDrawerWidth = useChatStore((state) => state.setChatDrawerWidth);
  const setActiveConversation = useChatStore(
    (state) => state.setActiveConversation,
  );

  const { isOpen, width, scope, scopeId, pageLabel } = chatDrawer;

  const scopeKey = getScopeKey(scope, scopeId);

  // Reactive subscription to the active conversation
  const conversationId = useChatStore(
    (state) => state.activeConversationIds[scopeKey] ?? null,
  );

  const createConversation = useCreateConversation();

  const isSessionPage = pathname?.startsWith("/session") ?? false;
  const drawerWidth = width === "expanded" ? 800 : 600;

  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeChatDrawer();
      }
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

  const handleSelectConversation = useCallback(
    (convId: string) => {
      setActiveConversation(scopeKey, convId);
    },
    [scopeKey, setActiveConversation],
  );

  const handleConversationNotFound = useCallback(() => {
    setActiveConversation(scopeKey, "");
  }, [scopeKey, setActiveConversation]);

  const toggleWidth = useCallback(() => {
    setChatDrawerWidth(width === "expanded" ? "normal" : "expanded");
  }, [width, setChatDrawerWidth]);

  console.log("ChatDrawer conversationId:", conversationId);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={closeChatDrawer}
        />
      )}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex flex-col border-l border-[var(--color-border-default)] bg-[var(--color-canvas)] transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ width: drawerWidth }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-border-subtle)] px-5 py-3">
          <div className="flex flex-col">
            <p className="font-display text-base font-semibold text-[var(--color-text-primary)]">
              Chat
            </p>
            {pageLabel && (
              <p className="text-xs text-[var(--color-text-muted)]">
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

        <ChatPanel
          conversationId={conversationId}
          scope={scope}
          scopeId={scopeId ?? undefined}
          onCreateConversation={handleCreateConversation}
          onSelectConversation={handleSelectConversation}
          onConversationNotFound={handleConversationNotFound}
          restricted={isSessionPage}
        />
      </div>
    </>
  );
}
