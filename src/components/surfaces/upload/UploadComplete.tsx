"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, Map, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompletedDocument {
  documentId: string;
  documentName: string;
}

interface UploadCompleteProps {
  completedDocuments: CompletedDocument[];
  isFirstUpload: boolean;
}

export function UploadComplete({
  completedDocuments,
  isFirstUpload,
}: UploadCompleteProps) {
  const router = useRouter();

  const count = completedDocuments.length;
  const lastDoc = completedDocuments[count - 1];

  return (
    <div className="w-full space-y-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
      </div>

      <div>
        <h3 className="font-display text-2xl text-[var(--color-text-primary)]">
          {count === 1
            ? "Your knowledge map is ready"
            : `${count} knowledge maps are ready`}
        </h3>
        <div className="mt-2 space-y-1">
          {completedDocuments.map((doc) => (
            <p key={doc.documentId} className="text-sm text-[var(--color-text-secondary)]">
              {doc.documentName}
            </p>
          ))}
        </div>
      </div>

      {isFirstUpload && (
        <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            {count === 1 ? "Your first document" : "Your first documents"}
          </p>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            We&apos;ve extracted concepts and mapped their relationships.
            Explore your knowledge map or start studying right away.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        {count === 1 && lastDoc ? (
          <>
            <Button
              className="rounded-xl bg-[var(--color-accent-primary)] text-white hover:opacity-90"
              onClick={() => router.push(`/mastery/${lastDoc.documentId}`)}
            >
              <Map className="mr-2 h-4 w-4" />
              View knowledge map
            </Button>
            <Button
              variant="outline"
              className="rounded-xl border-[var(--color-border-default)] bg-[var(--color-surface)]"
              onClick={() => router.push(`/session?documentId=${lastDoc.documentId}`)}
            >
              <Play className="mr-2 h-4 w-4" />
              Start studying
            </Button>
          </>
        ) : (
          <>
            <Button
              className="rounded-xl bg-[var(--color-accent-primary)] text-white hover:opacity-90"
              onClick={() => router.push("/library")}
            >
              <Map className="mr-2 h-4 w-4" />
              View in library
            </Button>
            <Button
              variant="outline"
              className="rounded-xl border-[var(--color-border-default)] bg-[var(--color-surface)]"
              onClick={() =>
                router.push(
                  lastDoc
                    ? `/session?documentId=${lastDoc.documentId}`
                    : "/library",
                )
              }
            >
              <Play className="mr-2 h-4 w-4" />
              Start studying
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
