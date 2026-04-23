import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import type { ProcessingStatus } from "@/lib/types/api";
import { cn } from "@/lib/utils";

const STAGES = ["Extract", "Identify", "Connect", "Ready"] as const;

interface ProcessingStatusProps {
  status: ProcessingStatus;
  errorMessage?: string | null;
}

export function ProcessingStatus({ status, errorMessage }: ProcessingStatusProps) {
  const stageIndex =
    status === "pending" ? 0 : status === "processing" ? 2 : status === "completed" ? STAGES.length - 1 : -1;
  const isFailed = status === "failed";

  const statusLabel = (() => {
    switch (status) {
      case "pending":
        return "Queued";
      case "processing":
        return "Building";
      case "completed":
        return "Ready";
      case "failed":
        return "Failed";
      default:
        return status;
    }
  })();

  return (
    <div className="space-y-3 text-white">
      <div className="flex items-center gap-2 text-sm text-white/70">
        {status === "completed" ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-300" />
        ) : status === "failed" ? (
          <AlertCircle className="h-4 w-4 text-rose-300" />
        ) : (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        <span className="uppercase tracking-[0.3em] text-white/50">{statusLabel}</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-4">
        {STAGES.map((label, index) => (
          <div
            key={label}
            className={cn(
              "rounded-2xl border border-white/10 px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60",
              index <= stageIndex && !isFailed && "border-white bg-white text-black",
              isFailed && "border-rose-500/40 bg-rose-500/10 text-rose-100",
            )}
          >
            {label}
          </div>
        ))}
      </div>
      {isFailed && (
        <p className="text-sm text-rose-200">
          {errorMessage ?? "Processing failed. Try re-uploading or checking the file format."}
        </p>
      )}
    </div>
  );
}
