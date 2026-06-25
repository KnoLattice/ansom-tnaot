/**
 * Mastery constants aligned with the backend's 4-band system,
 * plus a 5-tier visual color scale for the frontend gradient.
 */

// ─── Backend-aligned bands ───────────────────────────
export const MASTERY_BANDS = {
  MASTERED: 0.85,
  PROFICIENT: 0.65,
  DEVELOPING: 0.4,
  LOW: 0,
} as const;

// ─── Frontend visual threshold (blueprint spec) ──────
// The "just mastered" callout fires at 0.70 (frontend-only)
export const MASTERY_CALLOUT_THRESHOLD = 0.7;

// ─── 5-tier color scale ──────────────────────────────
// Maps a 0-1 score to one of five visual tiers for gradient display.
export const MASTERY_TIERS = [
  { min: 0, max: 0.2, label: "Struggling", tailwind: "red-600", hex: "#DC2626" },
  { min: 0.2, max: 0.4, label: "Emerging", tailwind: "amber-600", hex: "#D97706" },
  { min: 0.4, max: 0.6, label: "Developing", tailwind: "yellow-600", hex: "#CA8A04" },
  { min: 0.6, max: 0.8, label: "Proficient", tailwind: "green-600", hex: "#16A34A" },
  { min: 0.8, max: 1.01, label: "Mastered", tailwind: "emerald-600", hex: "#059669" },
] as const;

/** Get the 5-tier color hex for a 0-1 mastery score. */
export function getMasteryTierColor(score: number): string {
  const tier = MASTERY_TIERS.find((t) => score >= t.min && score < t.max);
  return tier?.hex ?? MASTERY_TIERS[0].hex;
}

/** Get the tier index (0-4) for a 0-1 mastery score. */
export function getMasteryTierIndex(score: number): number {
  const idx = MASTERY_TIERS.findIndex((t) => score >= t.min && score < t.max);
  return idx === -1 ? 0 : idx;
}

/** Get the tier label for a 0-1 mastery score. */
export function getMasteryTierLabel(score: number): string {
  const tier = MASTERY_TIERS.find((t) => score >= t.min && score < t.max);
  return tier?.label ?? MASTERY_TIERS[0].label;
}

// ─── Animation timing (blueprint spec) ──────────────
export const MASTERY_ANIMATION = {
  /** Duration for mastery bar fill in seconds */
  barFillDuration: 0.6,
  /** Ease curve for mastery bar */
  barEase: [0.16, 1, 0.3, 1] as const,
  /** Delay before delta badge appears (seconds) */
  deltaBadgeDelay: 0.4,
  /** Duration for delta badge entrance */
  deltaBadgeDuration: 0.3,
  /** Stagger delay between items in lists (seconds) */
  listStagger: 0.06,
} as const;
