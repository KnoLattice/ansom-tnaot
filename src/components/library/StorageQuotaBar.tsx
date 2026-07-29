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
    <div className="rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="kl-data-label">Storage</p>
        <p className="text-xs text-[var(--color-text-secondary)]">
          {used.toFixed(1)}MB used / {remaining >= 0 ? remaining.toFixed(1) : "0.0"}MB
          remaining
        </p>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--color-border-subtle)]">
        <div
          className={cn(
            "h-full rounded-full bg-[var(--color-accent-primary)] transition-all",
            percent > 90 && "bg-red-400",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-[var(--color-text-muted)]">
        Total quota: {total.toFixed(1)}MB
      </p>
    </div>
  );
}
