"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { API_ROUTES } from "@/lib/api/routes";
import type {
  Exploration,
  ExplorationCreateResponse,
  ExplorationDetail,
} from "@/lib/types/api";

export function useExplorations() {
  return useQuery<Exploration[]>({
    queryKey: ["explorations"],
    queryFn: async () => {
      const { data } = await apiClient.get<Exploration[]>(
        API_ROUTES.EXPLORATION.ROOT,
      );
      return data;
    },
  });
}

export function useExploration(id: string | null) {
  return useQuery<ExplorationDetail>({
    queryKey: ["explorations", id],
    queryFn: async () => {
      const { data } = await apiClient.get<ExplorationDetail>(
        API_ROUTES.EXPLORATION.ONE(id!),
      );
      return data;
    },
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const status = query.state.data?.exploration.status;
      if (status === "searching" || status === "processing") return 3000;
      return false;
    },
  });
}

export function useCreateExploration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      query: string;
      collectionId?: string;
      autoAccept?: boolean;
    }) => {
      const { data } = await apiClient.post<ExplorationCreateResponse>(
        API_ROUTES.EXPLORATION.ROOT,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["explorations"] });
    },
    onError: () => {
      toast.error("Failed to start exploration");
    },
  });
}

export function useAcceptResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      explorationId,
      resourceId,
    }: {
      explorationId: string;
      resourceId: string;
    }) => {
      const { data } = await apiClient.post<{ message: string }>(
        API_ROUTES.EXPLORATION.ACCEPT(explorationId, resourceId),
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["explorations", variables.explorationId],
      });
      toast.success("Resource accepted — processing started");
    },
    onError: () => {
      toast.error("Failed to accept resource");
    },
  });
}

export function useRejectResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      explorationId,
      resourceId,
    }: {
      explorationId: string;
      resourceId: string;
    }) => {
      const { data } = await apiClient.post<{ message: string }>(
        API_ROUTES.EXPLORATION.REJECT(explorationId, resourceId),
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["explorations", variables.explorationId],
      });
      toast.success("Resource rejected");
    },
    onError: () => {
      toast.error("Failed to reject resource");
    },
  });
}

export function useAcceptAllResources() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (explorationId: string) => {
      const { data } = await apiClient.post<{ message: string }>(
        API_ROUTES.EXPLORATION.ACCEPT_ALL(explorationId),
      );
      return data;
    },
    onSuccess: (_data, explorationId) => {
      queryClient.invalidateQueries({
        queryKey: ["explorations", explorationId],
      });
      toast.success("All resources accepted — processing started");
    },
    onError: () => {
      toast.error("Failed to accept resources");
    },
  });
}

export function useDeleteExploration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (explorationId: string) => {
      const { data } = await apiClient.delete<{ message: string }>(
        API_ROUTES.EXPLORATION.ONE(explorationId),
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["explorations"] });
      toast.success("Exploration deleted");
    },
    onError: () => {
      toast.error("Failed to delete exploration");
    },
  });
}
