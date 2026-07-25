import { RadarChart } from "@harmony/charts/v3";
import { Card, CardContent, CardHeader, CardTitle } from "@harmony/ui/components/card";
import { useQuery } from "@tanstack/react-query";

import { query } from "@/lib/query";

export function DaysOfWeekWidget() {
  const { data } = useQuery(query.listeningHabits.daysOfWeek.queryOptions());

  const metrics = data?.metrics ?? [];
  const series = data?.data ?? [];

  const newData =
    metrics.length && series.length
      ? metrics.map((metric) => ({
          label: metric.label,
          value: series[0]?.values[metric.key] ?? 0,
        }))
      : [];

  return (
    <Card size="xs" className="h-full pb-0">
      <CardHeader className="px-3 pt-3">
        <CardTitle className="text-muted-foreground">Days of the Week</CardTitle>
      </CardHeader>
      <CardContent>
        <RadarChart
          className="aspect-4/3"
          data={newData}
          config={{
            value: {
              label: "Time",
              colors: {
                light: ["#1db954"],
              },
            },
          }}
        >
          <RadarChart.PolarGrid />
          <RadarChart.PolarAngleAxis dataKey="label" />
          <RadarChart.Radar dataKey="value" variant="filled" />
        </RadarChart>
      </CardContent>
    </Card>
  );
}
