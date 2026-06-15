"use client";

import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { getMasteryTierColor } from "@/lib/constants/mastery";

interface MasterySparklineProps {
  /** Array of mastery scores (0-1) over time */
  data: number[];
  /** Height of the sparkline in pixels */
  height?: number;
  className?: string;
}

export function MasterySparkline({
  data,
  height = 40,
  className,
}: MasterySparklineProps) {
  if (data.length === 0) return null;

  const latest = data[data.length - 1];
  const color = getMasteryTierColor(latest);
  const chartData = data.map((value, index) => ({ index, value }));

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <defs>
            <linearGradient id={`sparkFill-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#sparkFill-${color})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
