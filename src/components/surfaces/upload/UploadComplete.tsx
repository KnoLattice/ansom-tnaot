"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, Map, PlayCircle } from "lucide-react";
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
    <div className="w-full space-y-6 rounded-2xl border border-green-500/20 bg-green-500/5 p-8 text-center">
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="h-8 w-8 text-green-400" />
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-white">
          {count === 1
            ? "Your knowledge map is ready"
            : `${count} knowledge maps are ready`}
        </h3>
        <div className="mt-2 space-y-1">
          {completedDocuments.map((doc) => (
            <p key={doc.documentId} className="text-sm text-text-secondary">
              {doc.documentName}
            </p>
          ))}
        </div>
      </div>

      {isFirstUpload && (
        <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-widest text-text-muted">
            {count === 1 ? "Your first document" : "Your first documents"}
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            We&apos;ve extracted concepts and mapped their relationships.
            Explore your knowledge map or start studying right away.
          </p>
        </div>
      )}

      {/* Actions — if multiple docs, link to library; if single, link to that doc */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        {count === 1 && lastDoc ? (
          <>
            <Button onClick={() => router.push(`/mastery/${lastDoc.documentId}`)}>
              <Map className="mr-2 h-4 w-4" />
              View my knowledge map
            </Button>
            <Button
              variant="secondary"
              className="border border-white/10 bg-white/10 text-white"
              onClick={() => router.push(`/session?documentId=${lastDoc.documentId}`)}
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              Start studying
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => router.push("/library")}>
              <Map className="mr-2 h-4 w-4" />
              View in library
            </Button>
            <Button
              variant="secondary"
              className="border border-white/10 bg-white/10 text-white"
              onClick={() =>
                router.push(
                  lastDoc
                    ? `/session?documentId=${lastDoc.documentId}`
                    : "/library",
                )
              }
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              Start studying
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
