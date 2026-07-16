import { SparklineChart, Area } from "@harmony/charts/v2";

import type { ListeningHabitTrendPoint } from "@/features/listening/types";

type MetricSparklineProps = {
  trend?: ListeningHabitTrendPoint[];
};

export function MetricSparkline({ trend = [] }: MetricSparklineProps) {
  return (
    <SparklineChart data={trend} xDataKey="date" className="aspect-[6/1]">
      <Area dataKey="value" />
    </SparklineChart>
  );
}
