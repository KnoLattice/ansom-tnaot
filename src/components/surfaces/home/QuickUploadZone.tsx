"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useUploadDocument } from "@/lib/hooks";
import { Button } from "@/components/ui/button";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = [
  "application/pdf",
  "text/plain",
];

interface QuickUploadZoneProps {
  onUploadComplete?: () => void;
  showFullUploadCTA?: boolean;
}

export function QuickUploadZone({ onUploadComplete, showFullUploadCTA = true }: QuickUploadZoneProps) {
  const router = useRouter();
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
        const message =
          err instanceof Error ? err.message : "Upload failed";
        toast.error(message);
      } finally {
        setIsUploading(false);
      }
    },
    [uploadDocument, onUploadComplete],
  );

  return (
    <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] px-4 py-3">
        <p className="kl-data-label">Quick Upload</p>
        {showFullUploadCTA && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/upload")}
            className="text-xs"
          >
            Full upload page →
          </Button>
        )}
      </div>
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
          "flex cursor-pointer flex-col items-center justify-center rounded-b-xl border-2 border-dashed border-[var(--color-border-subtle)] p-8 text-center transition-all duration-300",
          isDragActive && "border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/5 scale-[1.01]",
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

        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-elevated)] transition-all duration-300",
          isDragActive && "bg-[var(--color-accent-primary)]/10 scale-110",
        )}>
          <Upload
            className={cn(
              "h-5 w-5 transition-colors duration-200",
              isDragActive ? "text-[var(--color-accent-primary)]" : "",
            )}
            style={{ color: isDragActive ? undefined : "var(--color-accent-primary)" }}
          />
        </div>
        <p className="mt-3 text-sm font-medium text-[var(--color-text-secondary)]">
          {isUploading
            ? "Uploading..."
            : isDragActive
              ? "Drop to upload"
              : "Drop file here or click to browse"}
        </p>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          PDF / TXT — Max 10MB
        </p>
      </label>
    </div>
  );
}
