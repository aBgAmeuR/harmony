import {
  Chart,
  barY,
  cell,
  chartBase,
  columnBand,
  columnTooltip,
  defineChart,
  intensity,
  intensityColor,
  intensityLevel,
  quietAxis,
  scaleBand,
  pointTooltip,
  IntensityLegend,
  xBand,
  yValue,
} from "@harmony/charts/v4";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { seriesOf } from "@/shared/lib/chart-series";
import { format } from "@/utils/format";

import { overviewQueries } from "./api";
import { Panel } from "./ui/panel";
import { useRanges } from "./use-range";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, "0"));
const HOUR_TICKS = ["00", "06", "12", "18"];
type Cell = { day: string; hour: string; value: number };
const SERIES = seriesOf("streams");

// The two charts share this left margin so their columns line up.
const MARGIN = { left: 32, right: 0, top: 0, bottom: 0 };
const HEATMAP_MARGIN = { ...MARGIN, bottom: 20 };

export const HabitsWidget = () => {
  const { range } = useRanges();
  const { data } = useQuery(overviewQueries.habits.queryOptions(range));
  const grid = data?.grid;

  const { heatmap, hours, maxHour, peakHour } = useMemo(() => {
    const rows = grid ?? [];
    const cells = DAYS.flatMap((day, d) =>
      HOURS.map((hour, h): Cell => ({ day, hour, value: rows[d]?.[h] ?? 0 })),
    );
    const byHour = HOURS.map((hour, h) => ({
      hour,
      value: rows.reduce((sum, row) => sum + (row[h] ?? 0), 0),
    }));
    const maxCell = Math.max(0, ...cells.map((c) => c.value));
    const max = Math.max(0, ...byHour.map((row) => row.value));

    return {
      maxHour: max,
      peakHour: byHour.find((row) => row.value === max)?.hour,
      heatmap: defineChart({
        ...chartBase,
        marks: [
          cell(cells, {
            id: "cells",
            x: "hour",
            y: "day",
            color: (c) => intensityLevel(c.value, maxCell),
            inset: 1,
            radius: 2,
          }),
        ],
        scales: {
          x: {
            scale: () => scaleBand<string>().padding(0),
            axis: quietAxis({ values: HOUR_TICKS }),
          },
          y: { scale: () => scaleBand<string>().padding(0), axis: quietAxis() },
        },
        color: intensityColor,
        margin: HEATMAP_MARGIN,
        focusRing: false,
        focus: "nearest-x",
        tooltip: pointTooltip((c: Cell) => ({
          title: `${c.day} ${c.hour}:00`,
          label: "Streams",
          value: format.count(c.value),
        })),
      }),
      hours: defineChart({
        ...chartBase,
        marks: [
          barY(byHour, {
            id: "hours",
            x: "hour",
            y: "value",
            z: () => "streams",
            fill: (row) => intensity(row.value, max),
            radius: 2,
          }),
          columnBand({ label: false }),
        ],
        scales: { x: xBand(), y: yValue() },
        guides: false,
        margin: MARGIN,
        ...columnTooltip(SERIES, { title: (hour) => `${hour}:00` }),
      }),
    };
  }, [grid]);

  return (
    <Panel title="When you listen" action={<IntensityLegend />}>
      <div className="flex flex-col gap-4">
        <Chart definition={heatmap} ariaLabel="Streams by weekday and hour" height={160} />

        <div className="flex flex-col gap-2 border-t pt-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Streams by hour</span>
            {maxHour > 0 ? (
              <span className="font-mono text-muted-foreground">Peak {peakHour}:00</span>
            ) : null}
          </div>
          <Chart definition={hours} ariaLabel="Streams by hour of the day" height={96} />
        </div>
      </div>
    </Panel>
  );
};
