import {
  Chart,
  areaY,
  barY,
  chartBase,
  colors,
  columnBand,
  columnGuide,
  columnTooltip,
  curves,
  decorative,
  defineChart,
  fadeGradient,
  lineY,
  ruleY,
  seriesColor,
  text,
  xBand,
  xPoint,
  yValue,
  type Series,
} from "@harmony/charts/v4";
import { useMemo } from "react";

import type { Kind } from "@/utils/format";

import { format } from "@/utils/format";

// One bucket of the period.
export type SeriesPoint = { name: string; value: number };

type SeriesChartProps = {
  points: SeriesPoint[];
  label: string;
  kind: Kind;
  view: "bars" | "area";
  // Labelled buckets on the category axis, all of them when absent.
  ticks?: string[];
  // Draws the value axis.
  axis?: boolean;
  aspectRatio: number;
  ariaLabel: string;
};

const CURRENT = "var(--chart-1)";

const mean = (values: number[]) =>
  values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

// Bars or an area over the period, with the average line.
export const SeriesChart = ({
  points,
  label,
  kind,
  view,
  ticks,
  axis = false,
  aspectRatio,
  ariaLabel,
}: SeriesChartProps) => {
  const definition = useMemo(() => {
    const value = (v: number) => format.as(v, kind);
    const series: Series = { current: { label, color: CURRENT, format: value } };

    // Buckets after the last play, such as months still to come, stay out of the average.
    const last = points.findLastIndex((point) => point.value > 0);
    const played = points.slice(0, last + 1);
    const average = mean(played.map((point) => point.value));
    const rows = points.map((point) => ({ ...point, series: "current" }));
    // The line stops on the last bucket played instead of dropping to zero.
    const current = rows.slice(0, last + 1);
    const lastName = played.at(-1)?.name;

    const body =
      view === "bars"
        ? [barY(rows, { id: "bars", x: "name", y: "value", z: "series", radius: 2 }), columnBand()]
        : [
            decorative(
              areaY(current, {
                id: "area",
                x: "name",
                y: "value",
                fill: "url(#series-fade)",
                curve: curves.monotone,
              }),
            ),
            lineY(current, {
              id: "line",
              x: "name",
              y: "value",
              z: "series",
              curve: curves.monotone,
              strokeWidth: 2,
            }),
            columnGuide(),
          ];

    const overlays =
      average > 0 && lastName
        ? [
            decorative(
              ruleY([average], {
                id: "average",
                stroke: colors.muted,
                strokeDasharray: "4 4",
                strokeOpacity: 0.8,
              }),
            ),
            decorative(
              text([{ name: lastName, value: average }], {
                id: "average-label",
                x: "name",
                y: "value",
                text: () => `Avg ${value(average)}`,
                anchor: "end",
                dy: -6,
                fontSize: 10,
                fill: colors.muted,
              }),
            ),
          ]
        : [];

    return defineChart({
      ...chartBase,
      color: seriesColor(series),
      ...columnTooltip(series),
      marks: [...body, ...overlays],
      scales: {
        // Tick values must exist on the axis, so an empty chart gets none.
        x: (view === "bars" ? xBand : xPoint)(
          ticks && points.length > 0 ? { values: ticks } : undefined,
          points.map((point) => point.name),
        ),
        y: axis ? yValue({ format: value }) : { ...yValue(), axis: false },
      },
      gradients: view === "area" ? [fadeGradient("series-fade", CURRENT)] : [],
    });
  }, [points, label, kind, view, ticks, axis]);

  return <Chart definition={definition} ariaLabel={ariaLabel} aspectRatio={aspectRatio} />;
};
