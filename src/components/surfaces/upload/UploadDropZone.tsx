"use client";

import { useCallback, useState } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadDropZoneProps {
  onFilesSelect: (files: File[]) => void;
  isUploading?: boolean;
  error?: string | null;
}

export function UploadDropZone({
  onFilesSelect,
  isUploading,
  error,
}: UploadDropZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFiles = useCallback(
    (files?: FileList | null) => {
      if (!files || files.length === 0) return;
      onFilesSelect(Array.from(files));
    },
    [onFilesSelect],
  );

  return (
    <label
      htmlFor="upload-zone-input"
      onDrop={(e) => {
        e.preventDefault();
        setIsDragActive(false);
        handleFiles(e.dataTransfer?.files);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragActive(true);
      }}
      onDragLeave={() => setIsDragActive(false)}
      className={cn(
        "relative flex min-h-[320px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--color-border-default)] bg-[var(--color-surface)] p-12 text-center transition-all duration-300",
        isDragActive &&
          "border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/5 border-solid scale-[1.01] shadow-lg",
        isUploading && "pointer-events-none opacity-60",
      )}
    >
      <input
        id="upload-zone-input"
        type="file"
        accept=".pdf,.txt"
        multiple
        className="sr-only"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div
        className={cn(
          "flex h-20 w-20 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] transition-all duration-300",
          isDragActive && "border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 scale-110",
        )}
      >
        <UploadCloud
          className={cn(
            "h-8 w-8 text-[var(--color-text-muted)] transition-all duration-200",
            isDragActive && "text-[var(--color-accent-primary)]",
          )}
        />
      </div>

      <p className="mt-6 text-lg font-semibold text-[var(--color-text-primary)]">
        {isDragActive
          ? "Release to upload"
          : isUploading
            ? "Uploading..."
            : "Drop your files here, or click to browse"}
      </p>
      <p className="mt-2 max-w-md text-sm text-[var(--color-text-muted)]">
        PDF, plain text. Lecture notes, textbook chapters, or any educational
        material. Max 10 MB per file · 50 MB total storage.
      </p>

      {error && (
        <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-500">
          {error}
        </p>
      )}
    </label>
  );
}
