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
  return (
    <Badge
      className={cn("border-0 text-white", className)}
      style={{ backgroundColor: getMasteryColor(band) }}
    >
      {labels[band]}
    </Badge>
  );
}
