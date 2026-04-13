import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.extend(duration);

export function fromNow(timestamp: string | null): string {
  if (!timestamp) return "Never";
  return dayjs(timestamp).fromNow();
}

export function formatDuration(ms: number): string {
  return dayjs.duration(ms).format("m[m] s[s]");
}

export function getGreeting(): string {
  const hour = dayjs().hour();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function bloomLevelLabel(level: number): string {
  const labels: Record<number, string> = {
    1: "Remember",
    2: "Understand",
    3: "Apply",
    4: "Analyze",
    5: "Evaluate",
    6: "Create",
  };
  return labels[level] ?? `Level ${level}`;
}
