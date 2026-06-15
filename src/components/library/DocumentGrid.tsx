import type { Document } from "@/lib/types/api";
import { DocumentCard } from "@/components/library/DocumentCard";
import { Skeleton } from "@/components/ui/skeleton";

interface DocumentGridProps {
  documents: Document[];
  isLoading: boolean;
  activeDocumentId: string | null;
  onSelect: (id: string) => void;
  onViewSpace: (id: string) => void;
  onViewProgress: (id: string) => void;
  onDelete: (id: string) => void;
}

export function DocumentGrid({
  documents,
  isLoading,
  activeDocumentId,
  onSelect,
  onViewSpace,
  onViewProgress,
  onDelete,
}: DocumentGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-[320px] rounded-3xl" />
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center text-white/70">
        <p className="text-lg font-medium">Your observatory is empty.</p>
        <p className="mt-2 text-sm">
          Upload lecture decks, research papers, or notes to generate a knowledge galaxy.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          document={doc}
          active={doc.id === activeDocumentId}
          onSelect={onSelect}
          onOpenUniverse={onViewSpace}
          onViewProgress={onViewProgress}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
