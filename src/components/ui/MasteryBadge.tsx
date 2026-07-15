import { Badge } from "./badge";
import { cn } from "@/lib/utils";
import { getMasteryColor } from "@/lib/utils/mastery";
import type { MasteryBand } from "@/lib/types/api";

const labels: Record<MasteryBand, string> = {
  mastered: "MASTERED",
  proficient: "PROFICIENT",
  developing: "DEVELOPING",
  low: "LOW",
};

interface MasteryBadgeProps {
  band: MasteryBand;
  className?: string;
}

export function MasteryBadge({ band, className }: MasteryBadgeProps) {
  const color = getMasteryColor(band);
  return (
    <Badge
      className={cn("border w-20 justify-center rounded-md text-center text-white", className)}
      style={{ backgroundColor: `${color}20`, borderColor: color, color }}
    >
      {labels[band]}
    </Badge>
  );
}
