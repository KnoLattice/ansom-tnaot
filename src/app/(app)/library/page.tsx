"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, FolderClosed, FolderUp, FileUp, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ActiveDocumentStrip } from "@/components/surfaces/library/ActiveDocumentStrip";
import { CollectionRow } from "@/components/surfaces/library/CollectionRow";
import { CollectionDocumentRow } from "@/components/surfaces/library/CollectionDocumentRow";
import { StorageQuotaBar } from "@/components/library/StorageQuotaBar";
import { useDocuments, useCollections } from "@/lib/hooks";
import { apiClient } from "@/lib/api/client";
import { API_ROUTES } from "@/lib/api/routes";

export default function LibraryPage() {
  const router = useRouter();
  const {
    documents,
    quota,
    isLoading: docsLoading,
    activeDocumentId,
    activeDocument,
    setActiveDocument,
    invalidateDocuments,
  } = useDocuments();

  const {
    collections,
    isLoading: collectionsLoading,
    createCollection,
    updateCollection,
    deleteCollection,
    assignDocument,
    isCreating,
  } = useCollections();

  const [showNewInput, setShowNewInput] = useState(false);
  const [newName, setNewName] = useState("");

  const isLoading = docsLoading || collectionsLoading;

  // Group documents by collection
  const { collectionDocs, uncollectedDocs } = useMemo(() => {
    const collectionDocs = new Map<string, typeof documents>();
    const uncollected: typeof documents = [];

    for (const doc of documents) {
      if (doc.collectionId) {
        const existing = collectionDocs.get(doc.collectionId) ?? [];
        existing.push(doc);
        collectionDocs.set(doc.collectionId, existing);
      } else {
        uncollected.push(doc);
      }
    }

    return { collectionDocs, uncollectedDocs: uncollected };
  }, [documents]);

  const handleCreateCollection = useCallback(async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    await createCollection({ name: trimmed });
    setNewName("");
    setShowNewInput(false);
    toast.success("Collection created");
  }, [newName, createCollection]);

  const handleRenameCollection = useCallback(
    async (id: string, name: string) => {
      await updateCollection({ id, name });
      toast.success("Collection renamed");
    },
    [updateCollection],
  );

  const handleDeleteCollection = useCallback(
    async (id: string) => {
      const result = await deleteCollection(id);
      toast.success(
        `Collection deleted. ${result.documentsReleased} document${result.documentsReleased !== 1 ? "s" : ""} moved to Uncategorized.`,
      );
    },
    [deleteCollection],
  );

  const handleDeleteDocument = useCallback(
    async (documentId: string) => {
      try {
        await apiClient.delete(API_ROUTES.DOCUMENTS.DELETE(documentId));
        if (activeDocumentId === documentId) {
          setActiveDocument(null);
        }
        await invalidateDocuments();
        toast.success("Document deleted");
      } catch {
        toast.error("Unable to delete document");
      }
    },
    [activeDocumentId, invalidateDocuments, setActiveDocument],
  );

  const handleAssignDocument = useCallback(
    async (documentId: string, collectionId: string | null) => {
      await assignDocument({ documentId, collectionId });
      toast.success(
        collectionId ? "Document moved" : "Document removed from collection",
      );
    },
    [assignDocument],
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

  const isEmpty = documents.length === 0 && collections.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border-default)] pb-4">
        <div>
          <h1 className="font-mono text-lg font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
            My Library
          </h1>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
            {collections.length > 0
              ? `${collections.length} collection${collections.length !== 1 ? "s" : ""}`
              : ""}
            {collections.length > 0 && documents.length > 0 ? " / " : ""}
            {documents.length > 0
              ? `${documents.length} document${documents.length !== 1 ? "s" : ""}`
              : isEmpty
                ? "Empty"
                : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border rounded-md"
            onClick={() => setShowNewInput(true)}
          >
            <FolderClosed className="mr-2 h-4 w-4" />
            NEW COLLECTION
          </Button>
          <Button
            onClick={() => router.push("/upload")}
            className="border rounded-md"
          >
            <FolderUp className="mr-2 h-4 w-4" />
            UPLOAD
          </Button>
        </div>
      </div>

      {/* Active document strip */}
      {activeDocument && activeDocument.processingStatus === "completed" && (
        <ActiveDocumentStrip document={activeDocument} />
      )}

      {/* Inline create collection input */}
      {showNewInput && (
        <div className="flex items-center gap-2 rounded-md border border-[var(--color-accent-primary)] bg-[var(--color-surface)] px-4 py-3">
          <FolderClosed className="h-4 w-4 shrink-0 text-[var(--color-accent-primary)]" />
          <input
            autoFocus
            className="min-w-0 flex-1 bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none"
            placeholder="Collection name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateCollection();
              if (e.key === "Escape") {
                setShowNewInput(false);
                setNewName("");
              }
            }}
          />
          <Button
            size="sm"
            variant="ghost"
            disabled={!newName.trim() || isCreating}
            onClick={handleCreateCollection}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setShowNewInput(false);
              setNewName("");
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Empty state */}
      {isEmpty ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center border-2 rounded-lg border-dashed border-[var(--color-border-default)] bg-[var(--color-surface)] p-12 text-center">
          <p className="font-mono text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
            No documents loaded
          </p>
          <p className="mt-2 max-w-md text-sm text-[var(--color-text-secondary)]">
            Upload your first study document to get started. We&apos;ll extract
            concepts and build your personal knowledge map.
          </p>
          <Button
            className="mt-6 border rounded-md"
            onClick={() => router.push("/upload")}
          >
            <FileUp className="mr-2 h-4 w-4" />
            UPLOAD FIRST DOCUMENT
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Collections */}
          {collections.map((col) => (
            <CollectionRow
              key={col.id}
              collection={col}
              documents={collectionDocs.get(col.id) ?? []}
              allCollections={collections}
              onRename={handleRenameCollection}
              onDelete={handleDeleteCollection}
              onDeleteDocument={handleDeleteDocument}
              onAssignDocument={handleAssignDocument}
              onViewMastery={handleViewMastery}
            />
          ))}

          {/* Uncollected documents */}
          {uncollectedDocs.length > 0 && (
            <div className="border rounded-md border-[var(--color-border-subtle)] bg-[var(--color-surface)]">
              <div className="px-4 py-3">
                <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  Uncategorized
                </h3>
              </div>
              <div className="border-t border-[var(--color-border-subtle)] bg-[var(--color-surface)]">
                <div className="space-y-px p-2">
                  {uncollectedDocs.map((doc) => (
                    <CollectionDocumentRow
                      key={doc.id}
                      document={doc}
                      collections={collections}
                      currentCollectionId={null}
                      onDelete={handleDeleteDocument}
                      onAssign={handleAssignDocument}
                      onViewMastery={handleViewMastery}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Storage quota */}
      {quota && <StorageQuotaBar quota={quota} />}
    </div>
  );
}
