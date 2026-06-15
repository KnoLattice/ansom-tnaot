import type { MasteryBand } from "@/lib/types/api";

const BAND_LABELS: Record<MasteryBand, string> = {
  mastered: "Mastered",
  proficient: "Proficient",
  developing: "Developing",
  low: "Low mastery",
};

const BAND_COLORS: Record<MasteryBand, string> = {
  mastered: "bg-emerald-500",
  proficient: "bg-lime-500",
  developing: "bg-amber-500",
  low: "bg-rose-500",
};

interface GraphLegendProps {
  distribution?: Record<MasteryBand, number> | null;
}

export function GraphLegend({ distribution }: GraphLegendProps) {
  return (
    <div className="flex flex-wrap gap-4 text-xs">
      {(Object.keys(BAND_LABELS) as MasteryBand[]).map((band) => (
        <div
          key={band}
          className="flex items-center gap-2 rounded-full border px-3 py-1"
        >
          <span className={`h-2 w-2 rounded-full ${BAND_COLORS[band]}`} />
          <div className="flex flex-col">
            <span className="font-medium">{BAND_LABELS[band]}</span>
            <span className="text-muted-foreground">
              {distribution?.[band] ?? 0} nodes
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
