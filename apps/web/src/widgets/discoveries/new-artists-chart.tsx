import {
  Chart,
  barY,
  chartBase,
  colors,
  columnBand,
  columnTooltip,
  decorative,
  defineChart,
  seriesColor,
  stack,
  text,
  xBand,
  yValue,
  type Series,
} from "@harmony/charts/v4";
import { useMemo } from "react";

import type { Discovery } from "@/data/discoveries";

import { addDays, isoDay, rangeDays, type Range } from "@/shared/lib/date";

import { Band } from "./rows";

const unitOf = (range: Range) => {
  const days = rangeDays(range);
  if (days <= 62) return "week";
  return days <= 731 ? "month" : "year";
};

const shortMonth = (date: Date) => date.toLocaleDateString("en-US", { month: "short" });

const startsOf = (range: Range, unit: ReturnType<typeof unitOf>) => {
  const starts: Date[] = [];
  if (unit === "week") {
    for (let date = range.from; date <= range.to; date = addDays(date, 7)) starts.push(date);
  } else if (unit === "month") {
    const end = range.to.getFullYear() * 12 + range.to.getMonth();
    for (let n = range.from.getFullYear() * 12 + range.from.getMonth(); n <= end; n++) {
      starts.push(new Date(Math.floor(n / 12), n % 12, 1));
    }
  } else {
    for (let year = range.from.getFullYear(); year <= range.to.getFullYear(); year++) {
      starts.push(new Date(year, 0, 1));
    }
  }
  return starts;
};

const bucketsOf = (range: Range, found: readonly Discovery[]) => {
  const unit = unitOf(range);
  const starts = startsOf(range, unit);
  const years = new Set(starts.map((date) => date.getFullYear())).size > 1;
  const buckets = starts.map((date, n) => {
    const key = isoDay(date);
    const next = starts[n + 1];
    const rows = found.filter(
      (row) => row.start >= key && (next === undefined || row.start < isoDay(next)),
    );
    const label =
      unit === "year"
        ? String(date.getFullYear())
        : unit === "week"
          ? `${date.getDate()} ${shortMonth(date)}`
          : `${shortMonth(date)}${years ? ` ${String(date.getFullYear()).slice(2)}` : ""}`;
    return { key, label, total: rows.length, kept: rows.filter((row) => !row.passed).length };
  });
  return { unit, buckets };
};

const series = {
  kept: { label: "Still playing", color: colors.tiers[0] },
  passed: { label: "Passed through", color: colors.tiers[3] },
} satisfies Series;

type ChartProps = { range: Range; found: readonly Discovery[] };

export const NewArtistsChart = ({ range, found }: ChartProps) => {
  const { unit, buckets } = useMemo(() => bucketsOf(range, found), [range, found]);
  const kept = buckets.reduce((sum, bucket) => sum + bucket.kept, 0);
  const counts = buckets.map((bucket) => bucket.total);

  const definition = useMemo(() => {
    const rows = buckets.flatMap((bucket) => [
      { name: bucket.label, series: "kept", value: bucket.kept },
      { name: bucket.label, series: "passed", value: bucket.total - bucket.kept },
    ]);
    const totals = buckets.filter((bucket) => bucket.total > 0);
    return defineChart({
      ...chartBase,
      color: seriesColor(series),
      ...columnTooltip(series),
      marks: [
        barY(rows, {
          id: "bars",
          x: "name",
          y: "value",
          z: "series",
          layout: stack({ order: ["kept", "passed"] }),
          radius: { end: 2, stack: "outer" },
        }),
        decorative(
          text(totals, {
            id: "totals",
            x: "label",
            y: "total",
            text: (bucket) => String(bucket.total),
            dy: -6,
            fontSize: 10,
            fill: colors.muted,
          }),
        ),
        columnBand(),
      ],
      scales: {
        x: xBand(
          undefined,
          buckets.map((bucket) => bucket.label),
        ),
        y: { ...yValue(), axis: false, grid: false },
      },
    });
  }, [buckets]);

  return (
    <section aria-labelledby="per-month" className="flex flex-col">
      <Band id="per-month" title={`New artists per ${unit}`}>
        <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span aria-hidden className="size-2 rounded-xs bg-chart-1" />
          Still playing
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span aria-hidden className="size-2 rounded-xs bg-chart-4" />
          Passed through
        </span>
      </Band>
      <div className="border-b border-border px-3 pt-4">
        <Chart
          definition={definition}
          height={128}
          ariaLabel={`New artists per ${unit}, from ${Math.min(...counts)} to ${Math.max(...counts)}, ${kept} of ${found.length} still playing`}
        />
      </div>
    </section>
  );
};
