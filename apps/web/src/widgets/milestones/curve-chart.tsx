import {
  Chart,
  areaY,
  chartBase,
  colors,
  columnGuide,
  columnTooltip,
  curves,
  decorative,
  defineChart,
  dot,
  fadeGradient,
  lineY,
  scaleLinear,
  scalePoint,
  seriesColor,
  text,
  xPoint,
  type Series,
} from "@harmony/charts/v4";
import { useMemo } from "react";

import { within, type Mark } from "@/data/milestones";
import { isoDay, type Range } from "@/shared/lib/date";
import { format } from "@/shared/lib/format";
import { Band } from "@/shared/primitives/band";

const HEADROOM = 1.15;

const series = {
  hours: {
    label: "Hours listened",
    color: colors.primary,
    format: (value) => `${format.count(value)} h`,
  },
} satisfies Series;

const monthLabel = (month: string) => format.month(`${month}-01`);

type CurveProps = {
  curve: readonly { month: string; hours: number }[];
  marks: readonly Mark[];
  hours: number;
  first: string;
  last: string;
  range: Range;
};

export const HoursCurve = ({ curve, marks, hours, first, last, range }: CurveProps) => {
  const step = 10 ** Math.floor(Math.log10(hours));

  const definition = useMemo(() => {
    const top = hours * HEADROOM;
    const months = curve.map((point) => point.month);
    const rows = curve.map((point) => ({ ...point, series: "hours" }));
    const at = new Map(curve.map((point) => [point.month, point.hours]));
    const dots = marks.flatMap((mark) => {
      const month = mark.date.slice(0, 7);
      const value = at.get(month);
      if (mark.kind !== "hours" || mark.threshold < step || value === undefined) return [];
      return [{ month, hours: value, threshold: mark.threshold, inside: within(mark.date, range) }];
    });
    const start = months.findIndex((month) => month >= isoDay(range.from).slice(0, 7));
    const end = months.findLastIndex((month) => month <= isoDay(range.to).slice(0, 7));
    const period =
      start === -1 || end < start
        ? []
        : months.slice(Math.max(start - 1, 0), end + 1).map((month) => ({ month, hours: top }));
    const latest = dots.slice(0, 1);

    return defineChart({
      ...chartBase,
      color: seriesColor(series),
      ...columnTooltip(series, { title: monthLabel }),
      marks: [
        decorative(
          areaY(period, {
            id: "period",
            x: "month",
            y: "hours",
            fill: "var(--foreground)",
            fillOpacity: 0.05,
            curve: curves.linear,
          }),
        ),
        decorative(
          areaY(rows, {
            id: "area",
            x: "month",
            y: "hours",
            fill: "url(#hours-fade)",
            curve: curves.monotone,
          }),
        ),
        lineY(rows, {
          id: "line",
          x: "month",
          y: "hours",
          z: "series",
          curve: curves.monotone,
          strokeWidth: 2,
        }),
        decorative(
          dot(
            dots.filter((mark) => !mark.inside),
            {
              id: "marks",
              x: "month",
              y: "hours",
              r: 3.5,
              fill: colors.tiers[2],
              stroke: colors.background,
              strokeWidth: 2,
            },
          ),
        ),
        decorative(
          dot(
            dots.filter((mark) => mark.inside),
            {
              id: "marks-in-period",
              x: "month",
              y: "hours",
              r: 4,
              fill: colors.primary,
              stroke: colors.background,
              strokeWidth: 2,
            },
          ),
        ),
        decorative(
          text(latest, {
            id: "latest",
            x: "month",
            y: "hours",
            text: (mark) => `${format.count(mark.threshold)} h`,
            anchor: "end",
            dx: -8,
            dy: -8,
            fontSize: 10,
            fill: colors.muted,
          }),
        ),
        columnGuide({ label: false }),
      ],
      scales: {
        x: {
          ...xPoint(
            {
              values: months.filter((month) => month.endsWith("-01")),
              format: (month) => month.slice(0, 4),
            },
            months,
          ),
          scale: scalePoint<string>().domain(months).padding(0),
        },
        y: { scale: scaleLinear().domain([0, top]), axis: false, grid: false },
      },
      gradients: [fadeGradient("hours-fade", colors.primary)],
    });
  }, [curve, marks, hours, range, step]);

  return (
    <section aria-labelledby="hours-curve" className="flex flex-col">
      <Band id="hours-curve" title="Hours listened, all time">
        <span className="ml-auto inline-flex items-center gap-1.5 text-muted-foreground">
          <span aria-hidden className="size-2 rounded-xs bg-foreground/10" />
          This period
        </span>
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <span aria-hidden className="size-2 rounded-full bg-chart-3" />
          Every {format.count(step)} h
        </span>
      </Band>
      <div className="border-b border-border px-3 pt-4">
        <Chart
          definition={definition}
          height={128}
          ariaLabel={`Hours listened from ${format.month(first)} to ${format.month(last)}: ${format.count(hours)} h, a mark every ${format.count(step)} h`}
        />
      </div>
    </section>
  );
};
