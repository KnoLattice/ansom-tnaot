"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ROUTES } from "@/lib/api/routes";
import type { WeakNode } from "@/lib/types/api";

interface WeakNodesResponse {
  weakNodes: WeakNode[];
}

export function useWeakNodes(documentId: string | null) {
  return useQuery<WeakNodesResponse>({
    queryKey: ["weak-nodes", documentId],
    queryFn: async () => {
      const { data } = await apiClient.get<WeakNodesResponse>(
        API_ROUTES.GRAPH.WEAK_NODES,
        { params: { documentId } },
      );
      return data;
    },
    enabled: Boolean(documentId),
    staleTime: 30_000,
  });
}
