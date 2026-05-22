"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { FileText, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { UploadDropZone } from "@/components/surfaces/upload/UploadDropZone";
import { UploadComplete } from "@/components/surfaces/upload/UploadComplete";
import { useDocuments, useUploadDocument } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function validateFile(file: File): string | null {
  if (!(file.type === "application/pdf" || file.type === "text/plain")) {
    return "Unsupported file type. Use PDF or plain text.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "File exceeds 10 MB limit.";
  }
  return null;
}

type FileUploadStatus = "pending" | "uploading" | "processing" | "completed" | "failed";

interface FileUploadItem {
  file: File;
  id: string;
  status: FileUploadStatus;
  error?: string;
  documentId?: string;
}

function statusLabel(status: FileUploadStatus): string {
  switch (status) {
    case "pending":
      return "Waiting";
    case "uploading":
      return "Uploading…";
    case "processing":
      return "Processing…";
    case "completed":
      return "Done";
    case "failed":
      return "Failed";
  }
}

export default function UploadPage() {
  const { documents, quota, invalidateDocuments, setActiveDocument } = useDocuments();
  const uploadDocument = useUploadDocument();

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadQueue, setUploadQueue] = useState<FileUploadItem[]>([]);
  const toastedIds = useRef<Set<string>>(new Set());

  const isUploading = uploadQueue.some(
    (item) => item.status === "uploading" || item.status === "processing",
  );
  const allDone =
    uploadQueue.length > 0 &&
    uploadQueue.every((item) => item.status === "completed" || item.status === "failed");
  const completedItems = uploadQueue.filter((item) => item.status === "completed");

  const isFirstUpload = documents.length === 0;

  // Sync processing status from the documents list (which auto-polls)
  useEffect(() => {
    if (uploadQueue.length === 0) return;

    setUploadQueue((prev) =>
      prev.map((item) => {
        if (!item.documentId) return item;
        if (item.status === "completed" || item.status === "failed") return item;

        const doc = documents.find((d) => d.id === item.documentId);
        if (!doc) return item;

        if (doc.processingStatus === "completed") {
          if (!toastedIds.current.has(item.documentId)) {
            toastedIds.current.add(item.documentId);
            toast.success(`${item.file.name} — knowledge graph ready!`);
          }
          return { ...item, status: "completed" as const };
        }
        if (doc.processingStatus === "failed") {
          if (!toastedIds.current.has(item.documentId)) {
            toastedIds.current.add(item.documentId);
            toast.error(`${item.file.name} — processing failed`);
          }
          return { ...item, status: "failed" as const, error: "Processing failed" };
        }
        return item;
      }),
    );
  }, [documents, uploadQueue.length]);

  const handleFilesSelect = useCallback(
    async (files: File[]) => {
      setUploadError(null);

      // Validate each file
      const validItems: FileUploadItem[] = [];
      const errors: string[] = [];

      for (const file of files) {
        const error = validateFile(file);
        if (error) {
          errors.push(`${file.name}: ${error}`);
        } else {
          validItems.push({
            file,
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            status: "pending",
          });
        }
      }

      if (errors.length > 0 && validItems.length === 0) {
        setUploadError(errors.join("\n"));
        return;
      }
      if (errors.length > 0) {
        toast.error(`${errors.length} file(s) skipped due to validation errors`);
      }

      // Check total size against remaining quota
      const totalNewSize = validItems.reduce((sum, item) => sum + item.file.size, 0);
      const remainingBytes = quota ? parseFloat(quota.remainingMB) * 1024 * 1024 : Infinity;

      if (totalNewSize > remainingBytes) {
        const remainingMB = quota ? quota.remainingMB : "unknown";
        setUploadError(
          `Total upload size (${(totalNewSize / 1024 / 1024).toFixed(1)} MB) exceeds your remaining storage (${remainingMB} MB).`,
        );
        return;
      }

      setUploadQueue(validItems);
      toastedIds.current = new Set();

      // Upload sequentially
      for (let i = 0; i < validItems.length; i++) {
        const item = validItems[i]!;

        setUploadQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, status: "uploading" } : q)),
        );

        try {
          const response = await uploadDocument(item.file);

          setUploadQueue((prev) =>
            prev.map((q) =>
              q.id === item.id
                ? { ...q, status: "processing", documentId: response.documentId }
                : q,
            ),
          );

          setActiveDocument(response.documentId);
          invalidateDocuments();
        } catch (error) {
          const message =
            (typeof error === "object" &&
              error !== null &&
              "response" in error &&
              typeof (error as { response?: { data?: { message?: string } } }).response?.data
                ?.message === "string" &&
              (error as { response?: { data?: { message?: string } } }).response?.data?.message) ||
            "Upload failed. Please try again.";

          setUploadQueue((prev) =>
            prev.map((q) => (q.id === item.id ? { ...q, status: "failed", error: message } : q)),
          );
        }
      }
    },
    [quota, setActiveDocument, uploadDocument, invalidateDocuments],
  );

  const handleReset = useCallback(() => {
    setUploadQueue([]);
    setUploadError(null);
    toastedIds.current = new Set();
  }, []);

  const showDropZone = uploadQueue.length === 0;
  const showQueue = uploadQueue.length > 0;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Title and context */}
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
          Upload study documents
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          We&apos;ll extract the concepts from your documents and build your
          personal knowledge map. You can upload multiple files at once.
        </p>
      </div>

      {/* Drop zone */}
      {showDropZone && (
        <UploadDropZone
          onFilesSelect={handleFilesSelect}
          isUploading={isUploading}
          error={uploadError}
        />
      )}

      {/* Upload queue — always visible until reset */}
      {showQueue && (
        <div className="space-y-4">
          {/* Summary header */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">
              {allDone
                ? `${completedItems.length}/${uploadQueue.length} completed`
                : `Processing ${uploadQueue.length} file${uploadQueue.length > 1 ? "s" : ""}…`}
            </p>
            {allDone && (
              <button
                type="button"
                className="text-xs text-[var(--color-accent-primary)] underline underline-offset-4"
                onClick={handleReset}
              >
                Upload more
              </button>
            )}
          </div>

          {/* Per-file rows */}
          <div className="space-y-2">
            {uploadQueue.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
                  item.status === "completed" && "border-green-500/20 bg-green-500/5",
                  item.status === "failed" && "border-red-500/20 bg-red-500/5",
                  item.status === "uploading" && "border-[var(--color-border-default)] bg-[var(--color-surface)]",
                  item.status === "pending" && "border-[var(--color-border-subtle)] bg-[var(--color-surface)]",
                )}
                style={
                  item.status === "processing"
                    ? {
                        borderColor: "color-mix(in srgb, var(--color-accent-primary) 30%, transparent)",
                        backgroundColor: "color-mix(in srgb, var(--color-accent-primary) 5%, transparent)",
                      }
                    : undefined
                }
              >
                {/* Status icon */}
                {item.status === "completed" && (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400" />
                )}
                {item.status === "failed" && (
                  <XCircle className="h-4 w-4 shrink-0 text-red-400" />
                )}
                {item.status === "processing" && (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[var(--color-accent-primary)]" />
                )}
                {item.status === "uploading" && (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[var(--color-text-muted)]" />
                )}
                {item.status === "pending" && (
                  <FileText className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
                )}

                {/* File name + error */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-[var(--color-text-primary)]">{item.file.name}</p>
                  {item.error && (
                    <p className="mt-0.5 truncate text-xs text-red-400">{item.error}</p>
                  )}
                </div>

                {/* Status label */}
                <span
                  className={cn(
                    "shrink-0 text-xs font-medium",
                    item.status === "completed" && "text-green-400",
                    item.status === "failed" && "text-red-400",
                    item.status === "processing" && "text-[var(--color-accent-primary)]",
                    item.status === "uploading" && "text-[var(--color-text-muted)]",
                    item.status === "pending" && "text-[var(--color-text-muted)]",
                  )}
                >
                  {statusLabel(item.status)}
                </span>

                {/* Size */}
                <span className="shrink-0 text-xs text-[var(--color-text-muted)]">
                  {(item.file.size / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>
            ))}
          </div>

          {/* Completion card once all done */}
          {allDone && completedItems.length > 0 && (
            <UploadComplete
              completedDocuments={completedItems.map((item) => ({
                documentId: item.documentId!,
                documentName: item.file.name,
              }))}
              isFirstUpload={isFirstUpload}
            />
          )}
        </div>
      )}

      {/* Existing documents strip */}
      {documents.length > 0 && (
        <div className="border-t border-[var(--color-border-subtle)] pt-6">
          <p className="text-sm text-[var(--color-text-muted)]">
            You have {documents.length} document{documents.length !== 1 ? "s" : ""} in your
            library.{" "}
            <Link
              href="/library"
              className="text-[var(--color-accent-primary)] underline underline-offset-4"
            >
              View library
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
