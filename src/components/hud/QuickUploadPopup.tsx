import { Button } from "@/components/ui/button";

interface QuickUploadPopupProps {
  onUpload: () => void;
}

export function QuickUploadPopup({ onUpload }: QuickUploadPopupProps) {
  return (
    <div className="kl-glass-panel pointer-events-auto mx-auto w-full max-w-xl rounded-3xl p-8 text-center text-white">
      <p className="text-xs uppercase tracking-[0.4em] text-white/50">Begin</p>
      <h3 className="mt-2 text-2xl font-semibold">Upload a document to generate your universe</h3>
      <p className="mt-2 text-sm text-white/70">
        Drop in lecture decks or PDFs. We will extract every concept and map prerequisites for you.
      </p>
      <Button className="mt-4 bg-[var(--color-accent-primary)] text-white" onClick={onUpload}>
        Upload document
      </Button>
    </div>
  );
}
