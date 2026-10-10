import type { ChartGradient, ChartMark, ChartMargin } from "@tanstack/charts";
import type { ChartDefinition } from "@tanstack/charts/react";

import { areaY, barY, crosshair, defineChart, dot, group, lineY, text } from "@tanstack/charts";
import { d3Curve } from "@tanstack/charts/d3/shape";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { scalePoint } from "@tanstack/charts/scales/point";
import { tooltip } from "@tanstack/charts/tooltip";
import { portal } from "@tanstack/charts/tooltip/portal";
import { curveLinear, curveMonotoneX } from "d3-shape";

import type { Curve, Row } from "../types";
import type { Parts } from "./parse";
import type { BarProps, MarkerProps, TooltipProps, XAxisProps, YAxisProps } from "./parts";

import { animation, colors, harmonyTheme } from "../theme";
import { toLabel, toNumber } from "../types";

// Reads the latest callbacks of the parts: the definition itself is only rebuilt when their
// structure changes, so inline formatters never trigger a re-render of the scene.
export type Reader = {
  tooltip: () => TooltipProps | null;
  xAxis: () => XAxisProps | null;
  yAxis: () => YAxisProps | null;
  marker: (index: number) => MarkerProps | undefined;
  bar: (dataKey: string) => BarProps | undefined;
};

export type XYDefinition = ChartDefinition<Row, string, number>;

type BuildInput = {
  data: readonly Row[];
  x: string;
  parts: Parts;
  read: Reader;
  margin?: number | Partial<ChartMargin>;
};

type Entry = { key: string; label: string; color: string };

// Background lines: dashed across, fainter solid ticks down.
const GRID_ACROSS = { stroke: "var(--foreground)", strokeOpacity: 0.14, strokeDasharray: "3 5" };
const GRID_DOWN = { stroke: "var(--foreground)", strokeOpacity: 0.07 };

const numbers = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const SERIES_COLORS = [colors.primary, colors.muted, "var(--chart-3)", "var(--chart-2)"] as const;

const seriesColor = (index: number): string =>
  SERIES_COLORS[index % SERIES_COLORS.length] ?? colors.primary;

const curveOf = (curve: Curve | undefined) =>
  d3Curve(curve === "linear" ? curveLinear : curveMonotoneX);

const isRow = (value: unknown): value is Row => typeof value === "object" && value !== null;

const pick = (data: readonly Row[], key: string, at: "max" | "min"): Row[] => {
  let best: Row | undefined;
  let bestValue = at === "max" ? -Infinity : Infinity;
  for (const row of data) {
    const value = toNumber(row[key]);
    if (value === null) continue;
    if (at === "max" ? value > bestValue : value < bestValue) {
      best = row;
      bestValue = value;
    }
  }
  return best ? [best] : [];
};

export const buildXY = ({ data, x, parts, read, margin }: BuildInput): XYDefinition => {
  const xOf = (row: Row) => toLabel(row[x]);
  const yOf = (key: string) => (row: Row) => toNumber(row[key]);

  const marks: ChartMark<Row, string, number>[] = [];
  const gradients: ChartGradient[] = [];
  // tooltip rows, one per series: points of one series share their `z`, so a line and its area
  // count once in the focus group
  const entries = new Map<string, Entry>();
  const seriesOf = (dataKey: string) => () => dataKey;

  parts.series.forEach((series, index) => {
    const { dataKey } = series.props;
    const label = series.props.label ?? dataKey;

    if (series.kind === "line") {
      const color = series.props.color ?? seriesColor(index);
      entries.set(dataKey, { key: dataKey, label, color });
      marks.push(
        lineY(data, {
          id: `${dataKey}:line`,
          z: seriesOf(dataKey),
          x: xOf,
          y: yOf(dataKey),
          stroke: color,
          strokeWidth: series.props.width ?? 2,
          curve: curveOf(series.props.curve),
          ...(series.props.dashed ? { strokeDasharray: "4 4" } : {}),
        }),
      );
    }

    if (series.kind === "area") {
      const color = series.props.color ?? seriesColor(index);
      const gradient = `area-${index}`;
      const withLine = series.props.line !== false;
      const curve = curveOf(series.props.curve);

      gradients.push({
        id: gradient,
        x1: 0,
        y1: 1,
        x2: 0,
        y2: 0,
        stops: [
          { offset: 0, color, opacity: 0 },
          { offset: 1, color, opacity: 0.4 },
        ],
      });
      entries.set(dataKey, { key: dataKey, label, color });
      marks.push(
        areaY(data, {
          id: `${dataKey}:area`,
          z: seriesOf(dataKey),
          x: xOf,
          y: yOf(dataKey),
          fill: `url(#${gradient})`,
          curve,
        }),
      );
      if (withLine) {
        marks.push(
          lineY(data, {
            id: `${dataKey}:line`,
            z: seriesOf(dataKey),
            x: xOf,
            y: yOf(dataKey),
            stroke: color,
            strokeWidth: series.props.width ?? 2,
            curve,
            ...(series.props.dashed ? { strokeDasharray: "4 4" } : {}),
          }),
        );
      }
    }
  });

  // Bars of every series share one mark so they can sit side by side in each band.
  const bars = parts.series.flatMap((series, index) =>
    series.kind === "bar" ? [{ props: series.props, index }] : [],
  );

  if (bars.length > 0) {
    const long: Row[] = bars.flatMap(({ props }) =>
      data.map((row) => ({
        x: xOf(row),
        series: props.dataKey,
        value: toNumber(row[props.dataKey]),
        row,
      })),
    );

    const colorOf = (datum: Row): string => {
      const key = toLabel(datum.series);
      const bar = bars.find(({ props }) => props.dataKey === key);
      const latest = read.bar(key)?.color ?? bar?.props.color;
      if (typeof latest === "function")
        return isRow(datum.row) ? latest(datum.row) : colors.primary;
      return latest ?? seriesColor(bar?.index ?? 0);
    };

    for (const { props, index } of bars) {
      entries.set(props.dataKey, {
        key: props.dataKey,
        label: props.label ?? props.dataKey,
        color: typeof props.color === "string" ? props.color : seriesColor(index),
      });
    }

    marks.push(
      barY(long, {
        id: "bars",
        key: (datum: Row) => `${toLabel(datum.series)}:${toLabel(datum.x)}`,
        x: (datum: Row) => toLabel(datum.x),
        y: (datum: Row) => toNumber(datum.value),
        z: (datum: Row) => toLabel(datum.series),
        fill: colorOf,
        radius: bars[0]?.props.radius ?? 2,
        ...(bars.length > 1 ? { layout: group({ padding: 0.1 }) } : {}),
      }),
    );
  }

  parts.markers.forEach((marker, index) => {
    const color = marker.color ?? colors.primary;
    const rows = pick(data, marker.dataKey, marker.at ?? "max");
    const labelOf = (row: Row): string => {
      const label = read.marker(index)?.label ?? marker.label;
      return typeof label === "function" ? label(row) : (label ?? "");
    };

    marks.push(
      dot(rows, {
        id: `marker-${index}`,
        x: xOf,
        y: yOf(marker.dataKey),
        r: 4,
        fill: color,
        stroke: colors.background,
        strokeWidth: 2,
      }),
    );
    if (marker.label !== undefined) {
      marks.push(
        text(rows, {
          id: `marker-label-${index}`,
          x: xOf,
          y: yOf(marker.dataKey),
          text: labelOf,
          dy: -14,
          fontSize: 11,
          fill: colors.muted,
        }),
      );
    }
  });

  const hover = parts.tooltip !== null;
  if (hover) marks.push(crosshair({ y: false }));

  const xAxis = parts.xAxis;
  const yAxis = parts.yAxis;

  return defineChart({
    marks,
    scales: {
      x: {
        scale:
          bars.length > 0
            ? () => scaleBand<string>().padding(0.2)
            : () => scalePoint<string>().padding(0),
        grid: parts.grid?.vertical ? GRID_DOWN : false,
        axis: xAxis
          ? {
              line: false,
              ticks: {
                size: 0,
                ...(xAxis.ticks ? { values: xAxis.ticks } : {}),
                format: (value: string) => read.xAxis()?.format?.(value) ?? value,
              },
            }
          : false,
      },
      y: {
        scale: scaleLinear,
        nice: true,
        grid: parts.grid ? GRID_ACROSS : false,
        ...(yAxis?.side ? { side: yAxis.side } : {}),
        axis: yAxis
          ? {
              line: false,
              ticks: {
                size: 0,
                ...(yAxis.ticks ? { count: yAxis.ticks } : {}),
                format: (value: number) => read.yAxis()?.format?.(value) ?? numbers.format(value),
              },
            }
          : false,
      },
    },
    gradients,
    clip: true,
    svgAnimation: animation,
    theme: harmonyTheme,
    ...(margin !== undefined ? { margin } : {}),
    focus: "group-x",
    maxFocusDistance: Number.POSITIVE_INFINITY,
    tooltip: hover
      ? {
          use: tooltip,
          portal,
          // a click must not pin the tooltip
          sticky: false,
          anchor: "group-center",
          placement: ["top", "right", "left", "bottom"],
          offset: 12,
          content: (points) => {
            const options = read.tooltip();
            const first = points[0];
            const order = [...entries.keys()];
            const rank = (point: (typeof points)[number]) => order.indexOf(point.groupLabel);
            const rows = [...points]
              .sort((a, b) => rank(a) - rank(b))
              .flatMap((point) => {
                const entry = entries.get(point.groupLabel);
                if (!entry) return [];
                const value = toNumber(point.yValue) ?? 0;
                return [
                  {
                    label: entry.label,
                    color: entry.color,
                    value: options?.format
                      ? options.format(value, entry.key)
                      : `${numbers.format(value)}${options?.suffix ?? ""}`,
                  },
                ];
              });
            const title = first ? toLabel(first.xValue) : undefined;
            return { title: title && options?.title ? options.title(title) : title, rows };
          },
        }
      : false,
  });
};
