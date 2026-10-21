import {
  Chart,
  IntensityLegend,
  cell,
  chartBase,
  defineChart,
  intensityColor,
  pointTooltip,
  quietAxis,
  scaleBand,
} from "@harmony/charts/v4";
import { Tabs, TabsList, TabsTrigger } from "@harmony/ui/components/tabs";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import type { ListeningDay, WhenYouListenByYear } from "@/data/listening/types";

import { format } from "@/utils/format";

import { listeningQueries } from "./api";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const month = new Intl.DateTimeFormat("en-US", { month: "short" });
const long = new Intl.DateTimeFormat("en-US", { dateStyle: "full" });

// Fixed stream counts per level, so a day reads the same in every year.
const levelOf = (count: number): number => {
  if (count > 150) return 4;
  if (count > 100) return 3;
  if (count > 50) return 2;
  return count > 0 ? 1 : 0;
};

const streams = (count: number): string =>
  `${format.count(count)} ${count === 1 ? "stream" : "streams"}`;

const EMPTY_WHEN_YOU_LISTEN: WhenYouListenByYear = {};
const CURRENT_YEAR = new Date().getFullYear();

export const WhenYouListenWidget = () => {
  const { data = EMPTY_WHEN_YOU_LISTEN } = useQuery(listeningQueries.whenYouListen.queryOptions());
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const years = Object.keys(data)
    .map(Number)
    .sort((a, b) => a - b);
  const activeYear = selectedYear ?? years.at(-1) ?? CURRENT_YEAR;
  const days = data[activeYear];

  const definition = useMemo(() => {
    const rows = days ?? [];
    // the week holding the first day of each month carries its label
    const monthStarts = new Map(
      rows.filter((day) => day.date.getDate() === 1).map((day) => [day.week, day.date]),
    );

    return defineChart({
      ...chartBase,
      marks: [
        cell(rows, {
          id: "days",
          x: "week",
          y: "day",
          color: (day) => levelOf(day.count),
          inset: 1,
          radius: 2,
        }),
      ],
      scales: {
        x: {
          scale: () => scaleBand<number>().padding(0),
          axis: quietAxis<number>({
            values: [...monthStarts.keys()],
            format: (week) => {
              const start = monthStarts.get(week);
              return start ? month.format(start) : "";
            },
          }),
        },
        y: {
          scale: () => scaleBand<number>().domain([0, 1, 2, 3, 4, 5, 6]).padding(0),
          axis: quietAxis<number>({ values: [1, 3, 5], format: (day) => WEEKDAYS[day] ?? "" }),
        },
      },
      color: intensityColor,
      focusRing: false,
      focus: "nearest-x",
      tooltip: pointTooltip((day: ListeningDay) => ({
        title: long.format(day.date),
        label: "Streams",
        value: streams(day.count),
      })),
    });
  }, [days]);

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-3">
        <span className="text-xs text-muted-foreground">When you listen</span>
        <div className="flex items-center justify-end gap-3">
          <IntensityLegend />
          {years.length > 0 ? (
            <Tabs
              onValueChange={(value) => setSelectedYear(Number(value))}
              value={String(activeYear)}
            >
              <TabsList>
                {years.map((year) => (
                  <TabsTrigger key={year} value={String(year)}>
                    {year}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          ) : null}
        </div>
      </div>
      <div className="px-2 py-3">
        <Chart
          definition={definition}
          ariaLabel={`Streams per day in ${activeYear}`}
          aspectRatio={6}
        />
      </div>
    </div>
  );
};
