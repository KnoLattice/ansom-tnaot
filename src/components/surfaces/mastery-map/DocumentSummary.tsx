"use client";

import { useState } from "react";
import { FileText, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { useDocumentSummary } from "@/lib/hooks";
import { apiClient } from "@/lib/api/client";
import { API_ROUTES } from "@/lib/api/routes";
import type { DocumentSummaryResponse } from "@/lib/types/api";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollViewport, Scrollbar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface DocumentSummaryProps {
  documentId: string;
}

export function DocumentSummary({ documentId }: DocumentSummaryProps) {
  const { data, isLoading, error, refetch } = useDocumentSummary(documentId);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await apiClient.post<DocumentSummaryResponse>(
        API_ROUTES.DOCUMENTS.GENERATE_SUMMARY(documentId),
      );
      await refetch();
      toast.success("Summary generated successfully");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? "Failed to generate summary";
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-2/3 rounded-lg" />
        <Skeleton className="h-4 w-full rounded-lg" />
        <Skeleton className="h-4 w-5/6 rounded-lg" />
        <Skeleton className="h-4 w-full rounded-lg" />
        <Skeleton className="h-6 w-1/2 mt-6 rounded-lg" />
        <Skeleton className="h-4 w-full rounded-lg" />
        <Skeleton className="h-4 w-4/5 rounded-lg" />
        <Skeleton className="h-4 w-full rounded-lg" />
        <Skeleton className="h-6 w-1/3 mt-6 rounded-lg" />
        <Skeleton className="h-4 w-full rounded-lg" />
        <Skeleton className="h-4 w-3/4 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
        <p className="font-display text-xl text-[var(--color-text-primary)]">
          Unable to load summary
        </p>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          {error instanceof Error ? error.message : "Something went wrong."}
        </p>
      </div>
    );
  }

  if (!data?.summary) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center text-center px-4">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-surface-elevated)]">
          <FileText className="h-6 w-6 text-[var(--color-text-muted)]" />
        </div>
        <p className="font-display text-xl text-[var(--color-text-primary)]">
          No summary available
        </p>
        <p className="mt-2 max-w-md text-sm text-[var(--color-text-secondary)]">
          This document was processed before summary generation was available.
          You can generate one now.
        </p>
        <Button
          className="mt-6 rounded-xl bg-[var(--color-accent-primary)] text-white hover:opacity-90"
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate summary
            </>
          )}
        </Button>
        {generating && (
          <p className="mt-3 text-xs text-[var(--color-text-muted)]">
            This may take a minute depending on document size
          </p>
        )}
      </div>
    );
  }

  return (
    <ScrollArea className="h-[70vh] overflow-hidden">
      <ScrollViewport className="h-full w-full">
        <div className="kl-summary-prose max-w-none overflow-hidden break-words p-6 pb-12">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {data.summary}
          </ReactMarkdown>
        </div>
      </ScrollViewport>
      <Scrollbar orientation="vertical" />
    </ScrollArea>
  );
}
