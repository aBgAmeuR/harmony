import {
  Chart,
  barY,
  chartBase,
  columnBand,
  columnTooltip,
  defineChart,
  xBand,
  yValue,
} from "@harmony/charts/v4";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@harmony/ui/components/card";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { seriesOf } from "@/shared/lib/chart-series";
import { useScope } from "@/shared/scope";

import { listeningQueries } from "./api";

const SERIES = seriesOf("playtime");

export const MonthlyActivityWidget = () => {
  const filter = useScope();
  const { data } = useQuery(listeningQueries.monthlyActivity.queryOptions(filter));

  const definition = useMemo(
    () =>
      defineChart({
        ...chartBase,
        marks: [
          barY(data ?? [], { id: "months", x: "name", y: "value", z: () => "playtime", radius: 2 }),
          columnBand(),
        ],
        scales: { x: xBand(), y: { ...yValue(), axis: false } },
        ...columnTooltip(SERIES),
      }),
    [data],
  );

  return (
    <Card size="sm" className="pb-0.5">
      <CardHeader>
        <CardTitle>Monthly Activity</CardTitle>
        <CardAction>
          <div className="flex items-center gap-2">
            <div className="size-2 shrink-0 rounded-full bg-chart-1" />
            <span className="text-xs text-legend-foreground">Time Listening</span>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Chart definition={definition} ariaLabel="Listening time by month" aspectRatio={4} />
      </CardContent>
    </Card>
  );
};
