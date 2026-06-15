"use client";

import { useCallback, useState } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFilesSelect: (files: File[]) => void;
  isUploading?: boolean;
  error?: string | null;
  compact?: boolean;
}

export function UploadZone({ onFilesSelect, isUploading, error, compact }: UploadZoneProps) {
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
      htmlFor="library-upload"
      onDrop={(event) => {
        event.preventDefault();
        setIsDragActive(false);
        handleFiles(event.dataTransfer?.files);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragActive(true);
      }}
      onDragLeave={() => setIsDragActive(false)}
      className={cn(
        "relative block w-full cursor-pointer rounded-3xl border border-dashed border-[var(--color-border-default)] bg-[var(--color-surface)] p-8 text-[var(--color-text-primary)] transition",
        compact ? "min-h-[180px]" : "min-h-[280px]",
        isDragActive && "border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/5",
      )}
    >
      <input
        id="library-upload"
        type="file"
        accept=".pdf,.txt"
        multiple
        className="sr-only"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <div className="flex h-full flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--color-border-default)] bg-[var(--color-surface-elevated)]">
          <UploadCloud className="h-7 w-7 text-[var(--color-text-muted)]" />
        </div>
        <p className="mt-4 font-medium text-[var(--color-text-primary)]">
          {isUploading ? "Uploading…" : "Drop your files here, or click to browse"}
        </p>
        <p className="mt-1 max-w-md text-sm text-[var(--color-text-muted)]">
          We parse lecture decks, course notes, and research PDFs up to 10 MB.
        </p>
        {error && <p className="mt-3 text-sm text-[var(--color-destructive)]">{error}</p>}
      </div>
    </label>
  );
}
