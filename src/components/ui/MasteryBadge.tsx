import { Badge } from "./badge";
import { cn } from "@/lib/utils";
import { getMasteryColor } from "@/lib/utils/mastery";
import type { MasteryBand } from "@/lib/types/api";

const labels: Record<MasteryBand, string> = {
  mastered: "Mastered",
  proficient: "Proficient",
  developing: "Developing",
  low: "Low",
};

interface MasteryBadgeProps {
  band: MasteryBand;
  className?: string;
}

export function MasteryBadge({ band, className }: MasteryBadgeProps) {
  const color = getMasteryColor(band);
  return (
    <Badge
      className={cn("rounded-full border text-xs font-medium", className)}
      style={{ backgroundColor: `${color}15`, borderColor: `${color}40`, color }}
    >
      {labels[band]}
    </Badge>
  );
}
