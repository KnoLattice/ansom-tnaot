"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { API_ROUTES } from "@/lib/api/routes";
import type {
  Document,
  DocumentStatusResponse,
  DocumentSummaryResponse,
  DocumentsResponse,
  UploadResponse,
} from "@/lib/types/api";
import { useGraphStore } from "@/store/graph.store";

export function useDocuments() {
  const queryClient = useQueryClient();
  const activeDocumentId = useGraphStore((state) => state.activeDocumentId);
  const setActiveDocument = useGraphStore((state) => state.setActiveDocument);
  const hasHydrated = useGraphStore((state) => state.hasHydrated);

  const query = useQuery<DocumentsResponse>({
    queryKey: ["documents"],
    queryFn: async () => {
      const { data } = await apiClient.get<DocumentsResponse>(
        API_ROUTES.DOCUMENTS.ROOT,
      );
      return data;
    },
    refetchInterval: (query) => {
      const docs = query.state.data?.documents ?? [];
      return docs.some(
        (doc) => doc.processingStatus === "pending" || doc.processingStatus === "processing",
      )
        ? 4000
        : false;
    },
  });

  const documents = useMemo(() => query.data?.documents ?? [], [query.data?.documents]);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!documents.length) {
      setActiveDocument(null);
      return;
    }

    if (activeDocumentId && documents.some((doc) => doc.id === activeDocumentId)) {
      return;
    }

    const fallback =
      documents.find((doc) => doc.processingStatus === "completed") ?? documents[0];

    if (fallback) {
      setActiveDocument(fallback.id);
    }
  }, [
    hasHydrated,
    activeDocumentId,
    documents,
    setActiveDocument,
  ]);

  const activeDocument = useMemo(
    () => documents.find((doc) => doc.id === activeDocumentId) ?? null,
    [activeDocumentId, documents],
  );

  const invalidateDocuments = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["documents"] }).catch(() => {
      toast.error("Unable to refresh documents");
    });
  }, [queryClient]);

  return {
    ...query,
    documents,
    quota: query.data?.quota,
    activeDocumentId,
    activeDocument,
    setActiveDocument,
    invalidateDocuments,
  };
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useCallback(
    async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await apiClient.post<UploadResponse>(
        API_ROUTES.DOCUMENTS.UPLOAD,
        formData,
      );

      await queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success(data.message);
      return data;
    },
    [queryClient],
  );
}

export function useDocumentStatus(documentId: string | null) {
  return useQuery<DocumentStatusResponse>({
    queryKey: ["document-status", documentId],
    queryFn: async () => {
      if (!documentId) throw new Error("Missing document id");
      const { data } = await apiClient.get<DocumentStatusResponse>(
        API_ROUTES.DOCUMENTS.STATUS(documentId),
      );
      return data;
    },
    enabled: Boolean(documentId),
    refetchInterval: (query) =>
      query.state.data && ["completed", "failed"].includes(query.state.data.processingStatus)
        ? false
        : 4000,
  });
}

export function useDocumentSummary(documentId: string | null) {
  return useQuery<DocumentSummaryResponse>({
    queryKey: ["document-summary", documentId],
    queryFn: async () => {
      if (!documentId) throw new Error("Missing document id");
      const { data } = await apiClient.get<DocumentSummaryResponse>(
        API_ROUTES.DOCUMENTS.SUMMARY(documentId),
      );
      return data;
    },
    enabled: Boolean(documentId),
    staleTime: 5 * 60 * 1000,
  });
}

export function formatDocumentName(doc?: Document | null) {
  if (!doc) return "Select a document";
  return doc.originalName;
}
