import { ChevronDown } from "lucide-react";
import { formatDocumentName } from "@/lib/hooks/useDocuments";
import type { Document } from "@/lib/types/api";
import { cn } from "@/lib/utils";

interface DocumentSwitcherProps {
  documents: Document[];
  activeDocumentId: string | null;
  onSelect: (id: string) => void;
  onUpload: () => void;
}

export function DocumentSwitcher({
  documents,
  activeDocumentId,
  onSelect,
  onUpload,
}: DocumentSwitcherProps) {
  const active = documents.find((doc) => doc.id === activeDocumentId);

  return (
    <div className="kl-glass-panel pointer-events-auto w-full rounded-2xl p-4 text-white">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/50">
        <span>Document</span>
        <button
          type="button"
          className="text-[var(--color-accent-secondary)] rounded-md border border-[var(--color-border-default)] hover:text-white"
          onClick={onUpload}
        >
          + Upload
        </button>
      </div>
      <button
        type="button"
        className="mt-3 flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm"
      >
        <span>{active ? formatDocumentName(active) : "Select a document"}</span>
        <ChevronDown className="h-4 w-4" />
      </button>
      <div className="mt-3 max-h-56 space-y-2 overflow-auto pr-1 text-sm">
        {documents.map((doc) => (
          <button
            key={doc.id}
            type="button"
            onClick={() => onSelect(doc.id)}
            className={cn(
              "w-full rounded-2xl border border-white/10 px-3 py-2 text-left transition",
              doc.id === activeDocumentId
                ? "bg-white text-black"
                : "bg-transparent text-white/70 hover:text-white",
            )}
          >
            <p className="font-medium">{doc.originalName}</p>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              {doc.processingStatus}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
