"use client";

import { useCallback, useState } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadDropZoneProps {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
  error?: string | null;
}

export function UploadDropZone({
  onFileSelect,
  isUploading,
  error,
}: UploadDropZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFiles = useCallback(
    (files?: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      if (!file) return;
      onFileSelect(file);
    },
    [onFileSelect],
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
        "relative flex min-h-[320px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 bg-white/[0.02] p-12 text-center transition",
        isDragActive &&
          "border-accent-primary bg-accent-primary/5 border-solid",
        isUploading && "pointer-events-none opacity-60",
      )}
    >
      <input
        id="upload-zone-input"
        type="file"
        accept=".pdf,.txt"
        className="sr-only"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-white/5 transition",
          isDragActive && "border-accent-primary bg-accent-primary/10",
        )}
      >
        <UploadCloud
          className={cn(
            "h-7 w-7 text-text-secondary",
            isDragActive && "text-accent-primary",
          )}
        />
      </div>

      <p className="mt-5 text-base font-medium text-white">
        {isDragActive
          ? "Release to upload"
          : isUploading
            ? "Uploading..."
            : "Drop your PDF or text file here, or click to browse"}
      </p>
      <p className="mt-2 max-w-md text-sm text-text-muted">
        PDF, plain text. Lecture notes, textbook chapters, or any educational
        material. Max 10 MB.
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {error}
        </p>
      )}
    </label>
  );
}
