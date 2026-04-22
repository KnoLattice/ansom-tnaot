"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ROUTES } from "@/lib/api/routes";
import type { GraphResponse } from "@/lib/types/api";

export function useGraph(documentId: string | null) {
  return useQuery<GraphResponse>({
    queryKey: ["graph", documentId],
    queryFn: async () => {
      if (!documentId) throw new Error("Missing document id");
      const { data } = await apiClient.get<GraphResponse>(
        API_ROUTES.GRAPH.TOPOLOGY,
        { params: { documentId } },
      );
      return data;
    },
    enabled: Boolean(documentId),
  });
}
