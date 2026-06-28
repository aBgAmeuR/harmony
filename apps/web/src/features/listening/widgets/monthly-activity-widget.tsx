import { query } from "@/lib/query";

import {
  Bar,
  BarChart,
  BarXAxis,
  chartCssVars,
  ChartTooltip,
  Grid,
} from "@harmony/charts";
import { useQuery } from "@tanstack/react-query";

export function MonthlyActivityWidget() {
  const { data = [] } = useQuery(
    query.listeningHabits.monthlyActivity.queryOptions(),
  );

  return (
    <div className="flex flex-col">
      <div className="flex justify-between px-4 pt-3">
        <span className="text-xs text-muted-foreground">Monthly Activity</span>
      </div>
      <div className="px-2">
        <BarChart
          aspectRatio="3 / 1"
          barGap={0.1}
          data={data}
          margin={{ top: 0, right: 8, bottom: 40, left: 8 }}
          xDataKey="name"
        >
          <Grid horizontal />
          <Bar dataKey="value" lineCap="butt" />
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
      </div>
    </div>
  );
}
