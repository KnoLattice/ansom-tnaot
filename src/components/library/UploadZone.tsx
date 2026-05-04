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
        "relative block w-full cursor-pointer rounded-3xl border border-dashed border-white/20 bg-white/5 p-8 text-white transition",
        compact ? "min-h-[180px]" : "min-h-[280px]",
        isDragActive && "border-[var(--color-accent-primary)] bg-[rgba(99,102,241,0.08)]",
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
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/10">
          <UploadCloud className="h-7 w-7" />
        </div>
        <p className="mt-4 font-medium text-white">
          {isUploading ? "Uploading…" : "Drag & drop PDFs or click to browse"}
        </p>
        <p className="mt-1 max-w-md text-sm text-white/60">
          We parse lecture decks, course notes, and research PDFs up to 10 MB.
        </p>
        {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
      </div>
    </label>
  );
}
