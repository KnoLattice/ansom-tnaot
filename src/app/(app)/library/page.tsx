"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ActiveDocumentStrip } from "@/components/surfaces/library/ActiveDocumentStrip";
import { DocumentRow } from "@/components/surfaces/library/DocumentRow";
import { StorageQuotaBar } from "@/components/library/StorageQuotaBar";
import { useDocuments } from "@/lib/hooks";
import { apiClient } from "@/lib/api/client";
import { API_ROUTES } from "@/lib/api/routes";

type SortKey = "recency" | "name";

export default function LibraryPage() {
  const router = useRouter();
  const {
    documents,
    quota,
    isLoading,
    activeDocumentId,
    activeDocument,
    setActiveDocument,
    invalidateDocuments,
  } = useDocuments();
  const [sortBy, setSortBy] = useState<SortKey>("recency");

  const sortedDocuments = useMemo(() => {
    const sorted = [...documents];
    if (sortBy === "name") {
      sorted.sort((a, b) => a.originalName.localeCompare(b.originalName));
    } else {
      sorted.sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
      );
    }
    return sorted;
  }, [documents, sortBy]);

  const handleDelete = useCallback(
    async (documentId: string) => {
      try {
        await apiClient.delete(API_ROUTES.DOCUMENTS.DELETE(documentId));
        if (activeDocumentId === documentId) {
          setActiveDocument(null);
        }
        await invalidateDocuments();
        toast.success("Document deleted");
      } catch (error) {
        const message =
          (typeof error === "object" &&
            error !== null &&
            "response" in error &&
            typeof (error as { response?: { data?: { message?: string } } })
              .response?.data?.message === "string" &&
            (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message) ||
          "Unable to delete document";
        toast.error(message);
      }
    },
    [activeDocumentId, invalidateDocuments, setActiveDocument],
  );

  const handleViewMastery = useCallback(
    (documentId: string) => {
      setActiveDocument(documentId);
      router.push(`/mastery/${documentId}`);
    },
    [router, setActiveDocument],
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 rounded-2xl bg-white/5" />
        <Skeleton className="h-10 w-48 rounded-lg bg-white/5" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl bg-white/5" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            Library
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {documents.length > 0
              ? `${documents.length} document${documents.length !== 1 ? "s" : ""}`
              : "No documents yet"}
          </p>
        </div>
        <Button onClick={() => router.push("/upload")}>
          <Plus className="mr-2 h-4 w-4" />
          Upload new document
        </Button>
      </div>

      {/* Active document strip */}
      {activeDocument && activeDocument.processingStatus === "completed" && (
        <ActiveDocumentStrip document={activeDocument} />
      )}

      {/* Documents list */}
      {documents.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-12 text-center">
          <p className="text-lg font-medium text-white">
            No documents yet
          </p>
          <p className="mt-2 max-w-md text-sm text-text-secondary">
            Upload your first study document to get started. We&apos;ll
            extract concepts and build your personal knowledge map.
          </p>
          <Button className="mt-6" onClick={() => router.push("/upload")}>
            <Plus className="mr-2 h-4 w-4" />
            Upload your first document
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Sort controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-text-muted"
              onClick={() =>
                setSortBy((s) => (s === "recency" ? "name" : "recency"))
              }
            >
              <ArrowUpDown className="mr-1.5 h-3 w-3" />
              Sort by {sortBy === "recency" ? "name" : "recency"}
            </Button>
          </div>

          {/* Document rows */}
          {sortedDocuments.map((doc) => (
            <DocumentRow
              key={doc.id}
              document={doc}
              isActive={doc.id === activeDocumentId}
              onSetActive={setActiveDocument}
              onViewMastery={handleViewMastery}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Storage quota */}
      {quota && <StorageQuotaBar quota={quota} />}
    </div>
  );
}
