import type { DocumentsResponse } from "@/lib/types/api";
import { cn } from "@/lib/utils";

interface StorageQuotaBarProps {
  quota?: DocumentsResponse["quota"];
}

export function StorageQuotaBar({ quota }: StorageQuotaBarProps) {
  const used = Number(quota?.usedMB ?? 0);
  const total = Number(quota?.totalMB ?? 0);
  const remaining = Number(quota?.remainingMB ?? 0);
  const percent = total > 0 ? Math.min(100, (used / total) * 100) : 0;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/70">
        <p className="font-medium uppercase tracking-[0.3em] text-white/50">Storage</p>
        <p>
          {used.toFixed(1)} MB used · {remaining >= 0 ? remaining.toFixed(1) : "0.0"} MB
          remaining
        </p>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn(
            "h-full rounded-full bg-[var(--color-accent-primary)] transition-all",
            percent > 90 && "bg-rose-400",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-xs uppercase tracking-[0.3em] text-white/40">
        Total quota · {total.toFixed(1)} MB
      </p>
    </div>
  );
}
