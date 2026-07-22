import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MentionRef } from "@/lib/types/api";

interface ChatStore {
  pendingMentions: MentionRef[];
  activeConversationIds: Record<string, string>;
  addPendingMention: (mention: MentionRef) => void;
  consumePendingMentions: () => MentionRef[];
  setActiveConversation: (scopeKey: string, conversationId: string) => void;
  getActiveConversation: (scopeKey: string) => string | null;
  clearActiveConversations: () => void;
}

function getScopeKey(scope: string, scopeId?: string | null): string {
  return scopeId ? `${scope}:${scopeId}` : scope;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      pendingMentions: [],
      activeConversationIds: {},

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
