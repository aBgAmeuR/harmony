import { BarChart } from "@harmony/charts/v3";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@harmony/ui/components/card";
import { useQuery } from "@tanstack/react-query";

import { useFilter } from "@/lib/filter";
import { query } from "@/lib/query";

export function MonthlyActivityWidget() {
  const filter = useFilter();
  const { data = [] } = useQuery(query.listeningHabits.monthlyActivity.queryOptions(filter));

  return (
    <Card size="sm" className="pb-0.5">
      <CardHeader>
        <CardTitle>Monthly Activity</CardTitle>
        <CardAction>
          <div className="flex items-center gap-2">
            <div className="size-2 shrink-0 rounded-full bg-chart-2" />
            <span className="text-xs text-legend-foreground">Time Listening</span>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <BarChart
          className="aspect-4/1"
          data={data}
          config={{
            value: {
              label: "Time",
              colors: {
                light: ["#1db954"],
              },
            },
          }}
          barCategoryGap={2}
        >
          <BarChart.Bar enableHoverHighlight dataKey="value" />
          <BarChart.XAxis dataKey="name" />
          <BarChart.Tooltip suffix="min" />
          <BarChart.Grid />
        </BarChart>
      </CardContent>
    </Card>
  );
}
