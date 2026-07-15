"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { apiClient, API_BASE_URL } from "@/lib/api/client";
import { API_ROUTES } from "@/lib/api/routes";
import { useAuthStore } from "@/store/auth.store";
import type {
  ChatConversation,
  ChatMessage,
  ChatTokenUsage,
  ChatScope,
  ChatStreamChunk,
} from "@/lib/types/api";

export function useChatConversations(scope?: ChatScope) {
  return useQuery<(ChatConversation & { messageCount: number })[]>({
    queryKey: ["chat-conversations", scope],
    queryFn: async () => {
      const params = scope ? `?scope=${scope}` : "";
      const { data } = await apiClient.get(
        `${API_ROUTES.CHAT.CONVERSATIONS}${params}`,
      );
      return data;
    },
  });
}

export function useChatMessages(conversationId: string | null) {
  return useQuery<{ conversation: ChatConversation; messages: ChatMessage[] }>({
    queryKey: ["chat-messages", conversationId],
    queryFn: async () => {
      if (!conversationId) throw new Error("Missing conversation id");
      const { data } = await apiClient.get(
        API_ROUTES.CHAT.CONVERSATION(conversationId),
      );
      return data;
    },
    enabled: Boolean(conversationId),
  });
}

export function useChatTokenUsage() {
  return useQuery<ChatTokenUsage>({
    queryKey: ["chat-token-usage"],
    queryFn: async () => {
      const { data } = await apiClient.get(API_ROUTES.CHAT.TOKEN_USAGE);
      return data;
    },
    staleTime: 30_000,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { scope: ChatScope; scopeId: string }) => {
      const { data } = await apiClient.post<ChatConversation>(
        API_ROUTES.CHAT.CONVERSATIONS,
        params,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      await apiClient.delete(API_ROUTES.CHAT.CONVERSATION(conversationId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
      toast.success("Conversation deleted");
    },
  });
}

export function useSendChatMessage() {
  const queryClient = useQueryClient();
  const abortRef = useRef<AbortController | null>(null);

  const mutate = useCallback(
    async (
      conversationId: string,
      content: string,
      onToken: (chunk: ChatStreamChunk) => void,
    ) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const token = useAuthStore.getState().token;
      const url = `${API_BASE_URL}${API_ROUTES.CHAT.MESSAGES(conversationId)}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content }),
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 429) {
          const err = await response.json();
          throw new Error(err.message ?? "Monthly token limit reached");
        }
        throw new Error("Failed to send message");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data:")) {
            try {
              const data = JSON.parse(line.slice(5).trim()) as ChatStreamChunk;
              onToken(data);
            } catch {
              // skip malformed SSE frames
            }
          }
        }
      }

      queryClient.invalidateQueries({ queryKey: ["chat-messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
      queryClient.invalidateQueries({ queryKey: ["chat-token-usage"] });
    },
    [queryClient],
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { mutate, abort };
}
