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

export function ReleaseYearWidget() {
  const { data = [] } = useQuery(
    query.listeningHabits.releaseYear.queryOptions(),
  );

  return (
    <div className="flex flex-col">
      <div className="flex justify-between px-4 pt-3">
        <span className="text-xs text-muted-foreground">Release Year</span>
      </div>
      <div className="px-2">
        <BarChart
          aspectRatio="4 / 1"
          barGap={0.1}
          data={data}
          margin={{ top: 0, right: 8, bottom: 40, left: 8 }}
          xDataKey="name"
        >
          <Grid horizontal />
          <Bar dataKey="value" lineCap="butt" />
          <BarXAxis maxLabels={6} />
          <ChartTooltip
            rows={(point) => [
              {
                color: chartCssVars.linePrimary,
                label: "Streams",
                value: point.value?.toLocaleString() ?? "0",
              },
            ]}
          />
        </BarChart>
      </div>
    </div>
  );
}
