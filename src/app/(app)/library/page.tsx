"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadZone } from "@/components/library/UploadZone";
import { StorageQuotaBar } from "@/components/library/StorageQuotaBar";
import { DocumentGrid } from "@/components/library/DocumentGrid";
import { ProcessingStatus } from "@/components/library/ProcessingStatus";
import { Button } from "@/components/ui/button";
import { useDocuments, useDocumentStatus, useUploadDocument } from "@/lib/hooks";
import { apiClient } from "@/lib/api/client";
import { API_ROUTES } from "@/lib/api/routes";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function validateFile(file?: File) {
  if (!file) return "No file selected";
  if (!(file.type === "application/pdf" || file.type === "text/plain")) {
    return "Only PDF or text files are supported";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "File exceeds the 10 MB limit";
  }
  return null;
}

export default function LibraryPage() {
  const router = useRouter();
  const {
    documents,
    quota,
    isLoading,
    activeDocumentId,
    setActiveDocument,
    invalidateDocuments,
  } = useDocuments();
  const uploadDocument = useUploadDocument();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [uploadStartedAt, setUploadStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const statusQuery = useDocumentStatus(processingId);

  const shouldShowFullZone = documents.length === 0;

  const handleFileSelect = useCallback(
    async (file: File) => {
      const validation = validateFile(file);
      setUploadError(validation);
      if (validation) return;

      setUploading(true);
      try {
        const response = await uploadDocument(file);
        setProcessingId(response.documentId);
        setUploadStartedAt(Date.now());
        setElapsedSeconds(0);
        setActiveDocument(response.documentId);
        toast.success("Upload received — building knowledge graph");
      } catch (error) {
        const message =
          (typeof error === "object" &&
            error !== null &&
            "response" in error &&
            typeof (error as { response?: { data?: { message?: string } } }).response?.data
              ?.message === "string" &&
            (error as { response?: { data?: { message?: string } } }).response?.data?.message) ||
          "Upload failed";
        setUploadError(message);
      } finally {
        setUploading(false);
      }
    },
    [setActiveDocument, uploadDocument],
  );

  useEffect(() => {
    if (!processingId || !uploadStartedAt) return;
    setElapsedSeconds(Math.floor((Date.now() - uploadStartedAt) / 1000));
    const interval = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - uploadStartedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [processingId, uploadStartedAt]);

  useEffect(() => {
    const status = statusQuery.data?.processingStatus;
    if (!status || !processingId) return;

    if (status === "completed") {
      toast.success("Knowledge graph ready");
      invalidateDocuments();
      const timeout = window.setTimeout(() => {
        setProcessingId(null);
        setUploadStartedAt(null);
        setElapsedSeconds(0);
      }, 1500);
      return () => window.clearTimeout(timeout);
    }

    if (status === "failed") {
      toast.error(statusQuery.data?.errorMessage ?? "Processing failed");
      invalidateDocuments();
      const timeout = window.setTimeout(() => {
        setProcessingId(null);
        setUploadStartedAt(null);
        setElapsedSeconds(0);
      }, 2500);
      return () => window.clearTimeout(timeout);
    }
  }, [invalidateDocuments, processingId, statusQuery.data?.errorMessage, statusQuery.data?.processingStatus]);

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
            typeof (error as { response?: { data?: { message?: string } } }).response?.data
              ?.message === "string" &&
            (error as { response?: { data?: { message?: string } } }).response?.data?.message) ||
          "Unable to delete document";
        toast.error(message);
      }
    },
    [activeDocumentId, invalidateDocuments, setActiveDocument],
  );

  const goToSpace = useCallback(
    (documentId: string) => {
      setActiveDocument(documentId);
      const search = new URLSearchParams({ documentId });
      router.push(`/space?${search.toString()}`);
    },
    [router, setActiveDocument],
  );

  const goToProgress = useCallback(
    (documentId: string) => {
      const search = new URLSearchParams({ documentId });
      router.push(`/progress?${search.toString()}`);
    },
    [router],
  );

  const heroCopy = useMemo(() => {
    if (documents.length === 0) {
      return "Upload your first document to light up the constellation.";
    }
    if (documents.some((doc) => doc.processingStatus !== "completed")) {
      return "We're weaving concepts together. New galaxies coming online soon.";
    }
    return "All documents processed — jump back into your learning universe.";
  }, [documents]);

  return (
    <div className="space-y-10 text-white">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f1021] via-[#0c0d17] to-[#090912] p-8 shadow-panel">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Library</p>
            <h1 className="mt-3 font-display text-4xl text-white">Your observatory</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/70">{heroCopy}</p>
          </div>
          <Button
            variant="secondary"
            className="border border-white/20 bg-white/10 text-white"
            onClick={() => router.push("/space")}
          >
            Return to universe
          </Button>
        </div>
      </section>

      <section className={cn(
        "rounded-3xl border border-white/10 bg-white/5 p-6",
        shouldShowFullZone && "border-none bg-transparent p-0",
      )}
      >
        {shouldShowFullZone ? (
          <UploadZone onFileSelect={handleFileSelect} isUploading={uploading} error={uploadError} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <UploadZone onFileSelect={handleFileSelect} isUploading={uploading} error={uploadError} compact />
            {processingId && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-sm uppercase tracking-[0.4em] text-white/50">Processing</p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {statusQuery.data?.originalName ?? "New document"}
                </h3>
                <p className="text-sm text-white/60">{elapsedSeconds}s elapsed</p>
                <div className="mt-4">
                  <ProcessingStatus
                    status={statusQuery.data?.processingStatus ?? "pending"}
                    errorMessage={statusQuery.data?.errorMessage}
                  />
                </div>
              </div>
            )}
          </div>
        )}
        <div className="mt-6">
          <StorageQuotaBar quota={quota} />
        </div>
      </section>

      <DocumentGrid
        documents={documents}
        isLoading={isLoading}
        activeDocumentId={activeDocumentId}
        onSelect={setActiveDocument}
        onViewSpace={goToSpace}
        onViewProgress={goToProgress}
        onDelete={handleDelete}
      />
    </div>
  );
}
