import { query } from "@/lib/query";
import { RadarArea, RadarChart, RadarGrid, RadarLabels } from "@harmony/charts";
import { useQuery } from "@tanstack/react-query";

export function DaysOfWeekWidget() {
  const { data } = useQuery(query.listeningHabits.daysOfWeek.queryOptions());

  const metrics = data?.metrics ?? [];
  const series = data?.data ?? [];

  return (
    <div className="flex flex-col">
      <div className="flex justify-between px-4 pt-3">
        <span className="text-xs text-muted-foreground">Days of the Week</span>
      </div>
      <div className="px-2">
        <RadarChart
          animate
          data={series}
          enterDurationMs={500}
          margin={24}
          metrics={metrics}
        >
          <RadarGrid showLabels={false} />
          <RadarLabels fontSize={10} offset={16} />
          {series.map((_, index) => (
            <RadarArea index={index} key={index} />
          ))}
        </RadarChart>
      </div>
    </div>
  );
}
