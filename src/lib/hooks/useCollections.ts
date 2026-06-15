"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { API_ROUTES } from "@/lib/api/routes";
import type {
  Collection,
  CollectionMasteryResponse,
  CollectionsResponse,
} from "@/lib/types/api";

export function useCollections() {
  const queryClient = useQueryClient();

  const query = useQuery<CollectionsResponse>({
    queryKey: ["collections"],
    queryFn: async () => {
      const { data } = await apiClient.get<CollectionsResponse>(
        API_ROUTES.COLLECTIONS.ROOT,
      );
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (dto: { name: string; description?: string }) => {
      const { data } = await apiClient.post<Collection>(
        API_ROUTES.COLLECTIONS.ROOT,
        dto,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
    onError: () => {
      toast.error("Failed to create collection");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      ...dto
    }: {
      id: string;
      name?: string;
      description?: string;
    }) => {
      const { data } = await apiClient.patch<Collection>(
        API_ROUTES.COLLECTIONS.ONE(id),
        dto,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
    onError: () => {
      toast.error("Failed to update collection");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<{
        deleted: boolean;
        documentsReleased: number;
      }>(API_ROUTES.COLLECTIONS.ONE(id));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: () => {
      toast.error("Failed to delete collection");
    },
  });

  const assignDocumentMutation = useMutation({
    mutationFn: async ({
      documentId,
      collectionId,
    }: {
      documentId: string;
      collectionId: string | null;
    }) => {
      const { data } = await apiClient.patch(
        API_ROUTES.DOCUMENTS.ASSIGN_COLLECTION(documentId),
        { collectionId },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: () => {
      toast.error("Failed to update document collection");
    },
  });

  return {
    collections: query.data?.collections ?? [],
    isLoading: query.isLoading,
    createCollection: createMutation.mutateAsync,
    updateCollection: updateMutation.mutateAsync,
    deleteCollection: deleteMutation.mutateAsync,
    assignDocument: assignDocumentMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}

export function useCollectionMastery(collectionId: string | null) {
  return useQuery<CollectionMasteryResponse>({
    queryKey: ["collections", collectionId, "mastery"],
    queryFn: async () => {
      const { data } = await apiClient.get<CollectionMasteryResponse>(
        API_ROUTES.COLLECTIONS.MASTERY(collectionId!),
      );
      return data;
    },
    enabled: Boolean(collectionId),
    staleTime: 30_000,
  });
}
