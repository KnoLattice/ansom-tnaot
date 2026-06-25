"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useUploadDocument } from "@/lib/hooks";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["application/pdf", "text/plain"];

interface QuickUploadZoneProps {
  onUploadComplete?: () => void;
  showFullUploadCTA?: boolean;
}

export function QuickUploadZone({ onUploadComplete }: QuickUploadZoneProps) {
  const uploadDocument = useUploadDocument();
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFiles = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;

      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error("Only PDF and plain text files are supported.");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File exceeds 10 MB limit.");
        return;
      }

      setIsUploading(true);
      try {
        await uploadDocument(file);
        onUploadComplete?.();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Upload failed";
        toast.error(message);
      } finally {
        setIsUploading(false);
      }
    },
    [uploadDocument, onUploadComplete],
  );

  return (
    <label
      htmlFor="home-upload-input"
      onDrop={(e) => {
        e.preventDefault();
        setIsDragActive(false);
        if (e.dataTransfer?.files) {
          handleFiles(Array.from(e.dataTransfer.files));
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragActive(true);
      }}
      onDragLeave={() => setIsDragActive(false)}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all",
        isDragActive
          ? "border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/5"
          : "border-[var(--color-border-default)] hover:border-[var(--color-accent-primary)]/40 hover:bg-[var(--color-surface-elevated)]",
        isUploading && "pointer-events-none opacity-60",
      )}
    >
      <input
        id="home-upload-input"
        type="file"
        accept=".pdf,.txt"
        className="sr-only"
        onChange={(e) => {
          if (e.target.files) {
            handleFiles(Array.from(e.target.files));
          }
          e.target.value = "";
        }}
      />

      {isUploading ? (
        <Loader2 className="h-5 w-5 animate-spin text-[var(--color-accent-primary)]" />
      ) : (
        <Upload
          className={cn(
            "h-5 w-5",
            isDragActive ? "text-[var(--color-accent-primary)]" : "text-[var(--color-text-muted)]",
          )}
        />
      )}
      <p className="mt-2 text-sm font-medium text-[var(--color-text-secondary)]">
        {isUploading
          ? "Uploading..."
          : isDragActive
            ? "Drop to upload"
            : "Drop a file here or click to browse"}
      </p>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
        PDF or TXT, up to 10 MB
      </p>
    </label>
  );
}
