import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatScope, MentionRef } from "@/lib/types/api";

interface ChatDrawerState {
  isOpen: boolean;
  scope: ChatScope;
  scopeId: string | null;
  width: "normal" | "expanded";
  pageLabel: string;
}

interface ChatStore {
  pendingMentions: MentionRef[];
  activeConversationIds: Record<string, string>;
  addPendingMention: (mention: MentionRef) => void;
  consumePendingMentions: () => MentionRef[];
  setActiveConversation: (scopeKey: string, conversationId: string) => void;
  getActiveConversation: (scopeKey: string) => string | null;
  clearActiveConversations: () => void;

  chatDrawer: ChatDrawerState;
  openChatDrawer: (scope: ChatScope, scopeId?: string | null, pageLabel?: string) => void;
  closeChatDrawer: () => void;
  toggleChatDrawer: () => void;
  setChatDrawerWidth: (width: "normal" | "expanded") => void;
}

function getScopeKey(scope: string, scopeId?: string | null): string {
  return scopeId ? `${scope}:${scopeId}` : scope;
}

const initialDrawerState: ChatDrawerState = {
  isOpen: false,
  scope: "general",
  scopeId: null,
  width: "normal",
  pageLabel: "",
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      pendingMentions: [],
      activeConversationIds: {},
      chatDrawer: initialDrawerState,

      addPendingMention: (mention) =>
        set((state) => {
          const exists = state.pendingMentions.some(
            (m) => m.type === mention.type && m.id === mention.id,
          );
          if (exists) return state;
          return { pendingMentions: [...state.pendingMentions, mention] };
        }),

      consumePendingMentions: () => {
        const { pendingMentions } = get();
        set({ pendingMentions: [] });
        return pendingMentions;
      },

      setActiveConversation: (scopeKey: string, conversationId: string) =>
        set((state) => ({
          activeConversationIds: {
            ...state.activeConversationIds,
            [scopeKey]: conversationId,
          },
        })),

      getActiveConversation: (scopeKey: string) => {
        const { activeConversationIds } = get();
        return activeConversationIds[scopeKey] ?? null;
      },

      clearActiveConversations: () =>
        set({ activeConversationIds: {} }),

      openChatDrawer: (scope, scopeId = null, pageLabel = "") =>
        set((state) => ({
          chatDrawer: {
            ...state.chatDrawer,
            isOpen: true,
            scope,
            scopeId,
            pageLabel,
          },
        })),

      closeChatDrawer: () =>
        set((state) => ({
          chatDrawer: { ...state.chatDrawer, isOpen: false },
        })),

      toggleChatDrawer: () =>
        set((state) => ({
          chatDrawer: {
            ...state.chatDrawer,
            isOpen: !state.chatDrawer.isOpen,
          },
        })),

      setChatDrawerWidth: (width) =>
        set((state) => ({
          chatDrawer: { ...state.chatDrawer, width },
        })),
    }),
    {
      name: "kl_chat_active",
      partialize: (state) => ({
        activeConversationIds: state.activeConversationIds,
      }),
    },
  ),
);

export { getScopeKey };
