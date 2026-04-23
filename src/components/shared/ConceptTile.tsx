"use client";

import { cn } from "@/lib/utils";
import { getMasteryTierColor } from "@/lib/constants/mastery";
import { formatMastery, getMasteryBand } from "@/lib/utils/mastery";
import { MasteryBadge } from "@/components/ui/MasteryBadge";
import type { MasteryBand } from "@/lib/types/api";

interface ConceptTileProps {
  title: string;
  masteryScore: number;
  masteryBand?: MasteryBand;
  isLocked?: boolean;
  isEligible?: boolean;
  subtitle?: string;
  onClick?: () => void;
  className?: string;
}

export function ConceptTile({
  title,
  masteryScore,
  masteryBand,
  isLocked = false,
  subtitle,
  onClick,
  className,
}: ConceptTileProps) {
  const band = masteryBand ?? getMasteryBand(masteryScore);
  const color = getMasteryTierColor(masteryScore);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLocked || !onClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl border border-white/8 bg-white/5 px-4 py-3 text-left transition-colors",
        !isLocked && onClick && "hover:bg-white/10 hover:border-white/15",
        isLocked && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      {/* Mastery dot */}
      <span
        className="h-3 w-3 shrink-0 rounded-full"
        style={{ backgroundColor: isLocked ? "#374151" : color }}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary">
          {title}
        </p>
        {subtitle && (
          <p className="truncate text-xs text-text-muted">{subtitle}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isLocked ? (
          <span className="text-xs text-text-muted">Locked</span>
        ) : (
          <>
            <span className="text-xs tabular-nums text-text-secondary">
              {formatMastery(masteryScore)}
            </span>
            <MasteryBadge band={band} className="hidden sm:inline-flex" />
          </>
        )}
      </div>
    </button>
  );
}
