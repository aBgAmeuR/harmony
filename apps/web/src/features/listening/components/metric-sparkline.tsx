import { Area, AreaChart } from "@harmony/charts";

import type { ListeningHabitTrendPoint } from "@/features/listening/types";

type MetricSparklineProps = {
  trend?: ListeningHabitTrendPoint[];
};

export function MetricSparkline({ trend = [] }: MetricSparklineProps) {
  return (
    <AreaChart
      animationDuration={500}
      aspectRatio="6 / 1"
      data={trend}
      margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
      className="-mb-0.5"
      xDataKey="date"
    >
      <Area dataKey="value" strokeWidth={2} fadeEdges={false} showHighlight={false} />
    </AreaChart>
  );
}
