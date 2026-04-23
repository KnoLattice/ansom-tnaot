"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ROUTES } from "@/lib/api/routes";
import type { ProgressDashboardResponse } from "@/lib/types/api";

export function useDashboard(documentId: string | null) {
  return useQuery<ProgressDashboardResponse>({
    queryKey: ["dashboard", documentId],
    queryFn: async () => {
      const { data } = await apiClient.get<ProgressDashboardResponse>(
        API_ROUTES.PROGRESS.DASHBOARD,
        { params: { documentId } },
      );
      return data;
    },
    enabled: Boolean(documentId),
    staleTime: 30_000,
  });
}
