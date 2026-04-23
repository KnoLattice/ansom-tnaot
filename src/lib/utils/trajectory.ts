/**
 * Interpret a sparkline slope to give a one-line trajectory description.
 * Takes an array of mastery scores (0-1) and returns a human-readable line.
 */
export function interpretTrajectory(data: number[]): string {
  if (data.length < 2) return "Not enough data yet.";

  const recent = data.slice(-7);
  const first = recent[0];
  const last = recent[recent.length - 1];
  const delta = last - first;

  if (delta > 0.05) return "You\u2019re trending upward.";
  if (delta < -0.05) return "Some concepts may need review.";

  // Check for plateau at high mastery
  if (last >= 0.7) return "Holding strong.";

  return "Steady progress.";
}
