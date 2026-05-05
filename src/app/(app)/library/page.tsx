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
      <div className="space-y-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-10 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border-default)] pb-4">
        <div>
          <h1 className="font-mono text-lg font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
            Library
          </h1>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
            {documents.length > 0
              ? `${documents.length} document${documents.length !== 1 ? "s" : ""} loaded`
              : "Empty"}
          </p>
        </div>
        <Button onClick={() => router.push("/upload")}>
          <Plus className="mr-2 h-4 w-4" />
          UPLOAD
        </Button>
      </div>

      {/* Active document strip */}
      {activeDocument && activeDocument.processingStatus === "completed" && (
        <ActiveDocumentStrip document={activeDocument} />
      )}

      {/* Documents list */}
      {documents.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center border-2 border-dashed border-[var(--color-border-default)] bg-[var(--color-surface)] p-12 text-center">
          <p className="font-mono text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
            No documents loaded
          </p>
          <p className="mt-2 max-w-md text-sm text-[var(--color-text-secondary)]">
            Upload your first study document to get started. We&apos;ll
            extract concepts and build your personal knowledge map.
          </p>
          <Button className="mt-6" onClick={() => router.push("/upload")}>
            <Plus className="mr-2 h-4 w-4" />
            UPLOAD FIRST DOCUMENT
          </Button>
        </div>
      ) : (
        <div className="space-y-1">
          {/* Sort controls */}
          <div className="flex items-center gap-2 pb-2">
            <Button
              variant="ghost"
              size="sm"
              className="font-mono text-[10px]"
              onClick={() =>
                setSortBy((s) => (s === "recency" ? "name" : "recency"))
              }
            >
              <ArrowUpDown className="mr-1.5 h-3 w-3" />
              SORT: {sortBy === "recency" ? "NAME" : "RECENCY"}
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
