import { RadarArea, RadarChart, RadarGrid, RadarLabels } from "@harmony/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@harmony/ui/components/card";
import { useQuery } from "@tanstack/react-query";

import { query } from "@/lib/query";

export function DaysOfWeekWidget() {
  const { data } = useQuery(query.listeningHabits.daysOfWeek.queryOptions());

  const metrics = data?.metrics ?? [];
  const series = data?.data ?? [];

  return (
    <Card size="xs" className="h-full">
      <CardHeader className="px-3 pt-3">
        <CardTitle className="text-muted-foreground">Days of the Week</CardTitle>
      </CardHeader>
      <CardContent>
        <RadarChart
          className="aspect-[4/3]"
          data={series}
          enterDurationMs={100}
          margin={24}
          metrics={metrics}
        >
          <RadarGrid showLabels={false} />
          <RadarLabels fontSize={10} offset={16} />
          {series.map((_, index) => (
            <RadarArea index={index} key={index} showPoints={false} />
          ))}
        </RadarChart>
      </CardContent>
    </Card>
  );
}
