import { Bar, BarChart, BarXAxis, chartCssVars, ChartTooltip, Grid } from "@harmony/charts";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@harmony/ui/components/card";
import { useQuery } from "@tanstack/react-query";

import { query } from "@/lib/query";

export function MonthlyActivityWidget() {
  const { data = [] } = useQuery(query.listeningHabits.monthlyActivity.queryOptions());

  return (
    <Card size="xs">
      <CardHeader className="px-3 pt-3">
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
          aspectRatio="4 / 1"
          barGap={0.2}
          data={data}
          margin={{ top: 0, right: 12, bottom: 40, left: 12 }}
          xDataKey="name"
        >
          <Grid horizontal hideHorizontalEdgeLines />
          <Bar dataKey="value" lineCap="butt" fill="var(--chart-2)" />
          <BarXAxis maxLabels={8} />
          <ChartTooltip
            rows={(point) => [
              {
                color: chartCssVars.linePrimary,
                label: "Activity",
                value: `${point.value?.toLocaleString()} min`,
              },
            ]}
          />
        </BarChart>
      </CardContent>
    </Card>
  );
}
