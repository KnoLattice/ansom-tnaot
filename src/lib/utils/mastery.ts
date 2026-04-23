import type { MasteryBand } from "../types/api";

export function getMasteryBand(score: number): MasteryBand {
  if (score >= 0.85) return "mastered";
  if (score >= 0.65) return "proficient";
  if (score >= 0.4) return "developing";
  return "low";
}

export function getMasteryColor(band: MasteryBand): string {
  const map: Record<MasteryBand, string> = {
    mastered: "#22c55e",
    proficient: "#84cc16",
    developing: "#f59e0b",
    low: "#ef4444",
  };
  return map[band];
}

export function formatMastery(score: number): string {
  return `${Math.round(score * 100)}%`;
}

export function masteryDeltaLabel(delta: number): string {
  const pct = Math.round(delta * 100);
  return `${pct >= 0 ? "+" : ""}${pct}%`;
}
