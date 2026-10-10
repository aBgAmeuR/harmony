import type { ChartMargin } from "@tanstack/charts";
import type { ChartDefinition } from "@tanstack/charts/react";

import { cell, defineChart } from "@tanstack/charts";
import { scaleBand } from "@tanstack/charts/scales/band";
import { tooltip } from "@tanstack/charts/tooltip";
import { portal } from "@tanstack/charts/tooltip/portal";
import { useMemo, useRef } from "react";

import type { Row } from "./types";

import { ChartSurface } from "./surface";
import { animation, colors, harmonyTheme } from "./theme";
import { toLabel, toNumber } from "./types";

// Level 0 is an empty cell, the others follow the chart scale from dim to bright.
const LEVELS = [colors.empty, ...colors.scale.slice(1)];

export type HeatmapProps<TDatum extends Row> = {
  data: readonly TDatum[];
  // Keys of the column and row categories, and of the numeric value.
  x: string;
  y: string;
  value: string;
  // Category order: left to right and top to bottom.
  xDomain: readonly string[];
  yDomain: readonly string[];
  // Columns that get a tick label, defaults to all of them.
  xTicks?: readonly string[];
  xFormat?: (value: string) => string;
  // Name and text of the tooltip value, e.g. "Streams" and "1,432".
  valueLabel?: string;
  format?: (value: number) => string;
  title?: (x: string, y: string) => string;
  ariaLabel: string;
  height?: number;
  aspectRatio?: number;
  className?: string;
  margin?: number | Partial<ChartMargin>;
};

type HeatmapDefinition = ChartDefinition<Row, string, string>;

const levelOf = (value: number | null, max: number): number => {
  if (!value || max <= 0) return 0;
  return Math.min(LEVELS.length - 1, Math.ceil((value / max) * (LEVELS.length - 1)));
};

export const Heatmap = <TDatum extends Row>({
  data,
  x,
  y,
  value,
  xDomain,
  yDomain,
  xTicks,
  xFormat,
  valueLabel,
  format,
  title,
  ariaLabel,
  height,
  aspectRatio,
  className,
  margin,
}: HeatmapProps<TDatum>) => {
  // Formatters are read through a ref: inline functions do not rebuild the chart.
  const latest = useRef({ xFormat, format, title });
  latest.current = { xFormat, format, title };

  const definition = useMemo<HeatmapDefinition>(() => {
    const rows: readonly Row[] = data;
    const max = Math.max(0, ...rows.map((row) => toNumber(row[value]) ?? 0));

    return defineChart({
      marks: [
        cell(rows, {
          id: "cells",
          x: (row: Row) => toLabel(row[x]),
          y: (row: Row) => toLabel(row[y]),
          color: (row: Row) => levelOf(toNumber(row[value]), max),
          inset: 1,
          radius: 2,
        }),
      ],
      scales: {
        x: {
          scale: () =>
            scaleBand<string>()
              .domain([...xDomain])
              .padding(0),
          axis: {
            line: false,
            ticks: {
              size: 0,
              ...(xTicks ? { values: xTicks } : {}),
              format: (tick: string) => latest.current.xFormat?.(tick) ?? tick,
            },
          },
        },
        y: {
          scale: () =>
            scaleBand<string>()
              .domain([...yDomain])
              .padding(0),
          axis: { line: false, ticks: { size: 0 } },
        },
      },
      color: {
        domain: LEVELS.map((_, level) => level),
        range: LEVELS,
      },
      svgAnimation: animation,
      theme: harmonyTheme,
      ...(margin !== undefined ? { margin } : {}),
      focusRing: false,
      focus: "nearest-x",
      tooltip: {
        use: tooltip,
        portal,
        sticky: false,
        placement: ["top", "right", "left", "bottom"],
        offset: 10,
        content: (points) => {
          const point = points[0];
          if (!point) return { rows: [] };
          const count = toNumber(point.datum[value]) ?? 0;
          const column = toLabel(point.xValue);
          const row = toLabel(point.yValue);
          return {
            title: latest.current.title?.(column, row) ?? `${row} ${column}`,
            rows: [
              {
                label: valueLabel ?? value,
                color: point.color,
                value: latest.current.format?.(count) ?? String(count),
              },
            ],
          };
        },
      },
    });
  }, [data, x, y, value, valueLabel, xDomain, yDomain, xTicks, margin]);

  return (
    <ChartSurface
      definition={definition}
      ariaLabel={ariaLabel}
      height={height}
      aspectRatio={aspectRatio}
      className={className}
    />
  );
};
