"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { UploadDropZone } from "@/components/surfaces/upload/UploadDropZone";
import { ProcessingPipeline } from "@/components/surfaces/upload/ProcessingPipeline";
import { UploadComplete } from "@/components/surfaces/upload/UploadComplete";
import { useDocuments, useDocumentStatus, useUploadDocument } from "@/lib/hooks";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function validateFile(file?: File): string | null {
  if (!file) return "No file selected";
  if (!(file.type === "application/pdf" || file.type === "text/plain")) {
    return "We couldn't read this file type. Please upload a PDF or plain text file.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "This file is too large. The maximum size is 10 MB.";
  }
  return null;
}

export default function UploadPage() {
  const { documents, invalidateDocuments, setActiveDocument } = useDocuments();
  const uploadDocument = useUploadDocument();

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingName, setProcessingName] = useState("");
  const [uploadStartedAt, setUploadStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [completed, setCompleted] = useState(false);

  const statusQuery = useDocumentStatus(processingId);
  const isFirstUpload = documents.length === 0 || (documents.length === 1 && processingId !== null);

  const handleFileSelect = useCallback(
    async (file: File) => {
      const validation = validateFile(file);
      setUploadError(validation);
      if (validation) return;

      setUploading(true);
      setCompleted(false);
      try {
        const response = await uploadDocument(file);
        setProcessingId(response.documentId);
        setProcessingName(file.name);
        setUploadStartedAt(Date.now());
        setElapsedSeconds(0);
        setActiveDocument(response.documentId);
        setUploadError(null);
      } catch (error) {
        const message =
          (typeof error === "object" &&
            error !== null &&
            "response" in error &&
            typeof (error as { response?: { data?: { message?: string } } })
              .response?.data?.message === "string" &&
            (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message) ||
          "We couldn't upload this file. Please try again.";
        setUploadError(message);
      } finally {
        setUploading(false);
      }
    },
    [setActiveDocument, uploadDocument],
  );

  // Elapsed timer
  useEffect(() => {
    if (!processingId || !uploadStartedAt || completed) return;
    setElapsedSeconds(Math.floor((Date.now() - uploadStartedAt) / 1000));
    const interval = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - uploadStartedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [processingId, uploadStartedAt, completed]);

  // Status watcher
  useEffect(() => {
    const status = statusQuery.data?.processingStatus;
    if (!status || !processingId) return;

    if (status === "completed" && !completed) {
      setCompleted(true);
      toast.success("Knowledge graph ready!");
      invalidateDocuments();
    }

    if (status === "failed") {
      toast.error(statusQuery.data?.errorMessage ?? "Processing failed");
      invalidateDocuments();
    }
  }, [
    completed,
    invalidateDocuments,
    processingId,
    statusQuery.data?.errorMessage,
    statusQuery.data?.processingStatus,
  ]);

  const handleReset = useCallback(() => {
    setProcessingId(null);
    setProcessingName("");
    setUploadStartedAt(null);
    setElapsedSeconds(0);
    setCompleted(false);
    setUploadError(null);
  }, []);

  const currentStatus = statusQuery.data?.processingStatus ?? "pending";
  const showDropZone = !processingId;
  const showPipeline = processingId && !completed;
  const showComplete = processingId && completed;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Title and context */}
      <div>
        <h1 className="font-display text-2xl font-bold text-white">
          Upload a study document
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          We&apos;ll extract the concepts from your document and build your
          personal knowledge map. This usually takes about a minute.
        </p>
      </div>

      {/* Drop zone / Pipeline / Complete */}
      {showDropZone && (
        <UploadDropZone
          onFileSelect={handleFileSelect}
          isUploading={uploading}
          error={uploadError}
        />
      )}

      {showPipeline && (
        <ProcessingPipeline
          status={currentStatus}
          errorMessage={statusQuery.data?.errorMessage}
          documentName={processingName}
          elapsedSeconds={elapsedSeconds}
        />
      )}

      {showComplete && processingId && (
        <UploadComplete
          documentId={processingId}
          documentName={processingName}
          isFirstUpload={isFirstUpload}
        />
      )}

      {/* Retry on failure */}
      {currentStatus === "failed" && (
        <button
          type="button"
          className="text-sm text-accent-primary underline underline-offset-4"
          onClick={handleReset}
        >
          Try uploading a different file
        </button>
      )}

      {/* Upload another after completion */}
      {showComplete && (
        <button
          type="button"
          className="text-sm text-text-muted underline underline-offset-4 hover:text-text-secondary"
          onClick={handleReset}
        >
          Upload another document
        </button>
      )}

      {/* Existing documents strip */}
      {documents.length > 0 && (
        <div className="border-t border-white/8 pt-6">
          <p className="text-sm text-text-muted">
            You have {documents.length} document{documents.length !== 1 ? "s" : ""} in your library.{" "}
            <Link
              href="/library"
              className="text-accent-primary underline underline-offset-4"
            >
              View library
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
