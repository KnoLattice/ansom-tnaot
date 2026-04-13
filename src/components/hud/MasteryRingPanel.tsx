import { Circle } from "lucide-react";
import type { GraphResponse } from "@/lib/types/api";

interface MasteryRingPanelProps {
  nodes?: GraphResponse["nodes"];
}

export function MasteryRingPanel({ nodes }: MasteryRingPanelProps) {
  const counts = nodes?.reduce(
    (acc, node) => {
      acc[node.masteryBand] = (acc[node.masteryBand] ?? 0) + 1;
      return acc;
    },
    { mastered: 0, proficient: 0, developing: 0, low: 0 },
  ) ?? { mastered: 0, proficient: 0, developing: 0, low: 0 };
  const total = nodes?.length ?? 0;
  const overall = total ? Math.round((nodes!.reduce((sum, node) => sum + node.masteryScore, 0) / total) * 100) : 0;

  return (
    <div className="kl-glass-panel pointer-events-auto w-64 rounded-3xl p-6 text-white">
      <p className="text-xs uppercase tracking-[0.3em] text-white/50">Mastery</p>
      <p className="mt-2 text-4xl font-semibold">{overall}%</p>
      <p className="text-sm text-white/60">Overall readiness</p>
      <div className="mt-4 space-y-2 text-sm">
        <LegendItem label="Mastered" value={counts.mastered} color="var(--color-node-mastered)" />
        <LegendItem label="Proficient" value={counts.proficient} color="var(--color-node-proficient)" />
        <LegendItem label="Developing" value={counts.developing} color="var(--color-node-developing)" />
        <LegendItem label="Low" value={counts.low} color="var(--color-node-low)" />
      </div>
    </div>
  );
}

function LegendItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between text-white/80">
      <div className="flex items-center gap-2">
        <Circle className="h-3 w-3" style={{ color }} />
        <span>{label}</span>
      </div>
      <span>{value}</span>
    </div>
  );
}
