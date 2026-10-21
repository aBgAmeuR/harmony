import {
  Chart,
  angleGrid,
  colors,
  defineChart,
  focusDot,
  pointTooltip,
  polar,
  polarBase,
  radialArea,
  radialCurves,
  radialGrid,
  radialLine,
  scaleLinear,
  scalePoint,
} from "@harmony/charts/v4";
import { Card, CardContent, CardHeader, CardTitle } from "@harmony/ui/components/card";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { measure } from "@/shared/lib/measure";
import { format } from "@/utils/format";

import { listeningQueries } from "./api";

type Day = { label: string; value: number };

export const DaysOfWeekWidget = () => {
  const { data } = useQuery(listeningQueries.daysOfWeek.queryOptions());

  const definition = useMemo(() => {
    const values = data?.data[0]?.values ?? {};
    const days = (data?.metrics ?? []).map((metric): Day => ({
      label: metric.label,
      value: values[metric.key] ?? 0,
    }));
    const max = Math.max(1, ...days.map((day) => day.value));

    return defineChart({
      ...polarBase,
      marks: [
        polar({
          radiusRatio: 0.78,
          scales: {
            angle: { scale: scalePoint<string>().domain(days.map((day) => day.label)), wrap: true },
            radius: { scale: scaleLinear().domain([0, max]) },
          },
          guides: [
            radialGrid({
              values: [0.25, 0.5, 0.75, 1].map((step) => step * max),
              shape: "polygon",
            }),
            angleGrid({ labels: true }),
          ],
          marks: [
            radialArea(days, {
              id: "area",
              angle: "label",
              radius: "value",
              curve: radialCurves.closed,
              fill: colors.primary,
              fillOpacity: 0.22,
            }),
            radialLine(days, {
              id: "line",
              angle: "label",
              radius: "value",
              curve: radialCurves.closed,
              stroke: colors.primary,
              strokeWidth: 2,
            }),
          ],
        }),
      ],
      focusRing: focusDot,
      tooltip: pointTooltip((day: Day) => ({
        title: day.label,
        label: measure.playtime.label,
        value: format.as(day.value, measure.playtime.kind),
      })),
    });
  }, [data]);

  return (
    <Card size="xs" className="h-full pb-0">
      <CardHeader className="px-3 pt-3">
        <CardTitle className="text-muted-foreground">Days of the Week</CardTitle>
      </CardHeader>
      <CardContent>
        <Chart
          definition={definition}
          ariaLabel="Listening time by day of the week"
          aspectRatio={4 / 3}
        />
      </CardContent>
    </Card>
  );
};
