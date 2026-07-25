import { AreaChart } from "@harmony/charts/v3";

import type { ListeningHabitTrendPoint } from "@/features/listening/types";

type MetricSparklineProps = {
  trend?: ListeningHabitTrendPoint[];
};

export function MetricSparkline({ trend = [] }: MetricSparklineProps) {
  return (
    <AreaChart
      data={trend}
      config={{
        value: {
          label: "Listening Time",
          colors: {
            light: ["#1db954"],
          },
        },
      }}
      chartOptions={{
        grid: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        },
      }}
      className="aspect-6/1 **:cursor-default!"
    >
      <AreaChart.Area
        dataKey="value"
        strokeVariant="solid"
        variant="solid"
        strokeWidth={2}
        isClickable={false}
      />
    </AreaChart>
  );
}
