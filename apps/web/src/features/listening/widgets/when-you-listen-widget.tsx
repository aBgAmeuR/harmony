import { query } from "@/lib/query";

import {
  HeatmapCells,
  HeatmapChart,
  HeatmapLegend,
  HeatmapTooltip,
  HeatmapXAxis,
  HeatmapYAxis,
} from "@harmony/charts";
import { Tabs, TabsList, TabsTrigger } from "@harmony/ui/components/tabs";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import type { WhenYouListenByYear } from "../types";

function formatTooltipLabel(count: number, date: Date): string {
  const word = count === 1 ? "stream" : "streams";
  return `${count.toLocaleString()} ${word} on ${new Intl.DateTimeFormat(
    "en-US",
    {
      month: "long",
      day: "numeric",
    },
  ).format(date)}`;
}

const LISTENING_HEATMAP_LEVEL_COLORS = [
  "var(--muted)",
  "var(--chart-4)",
  "var(--chart-3)",
  "var(--chart-2)",
  "var(--chart-1)",
] as const;

const colorScale = (count: number | null | undefined): string => {
  if (!count || count === 0) return "var(--muted)";
  if (count > 50) return "var(--chart-4)";
  if (count > 100) return "var(--chart-3)";
  if (count > 150) return "var(--chart-2)";
  return "var(--chart-1)";
};

const EMPTY_WHEN_YOU_LISTEN: WhenYouListenByYear = {};

export function WhenYouListenWidget() {
  const { data = EMPTY_WHEN_YOU_LISTEN } = useQuery(
    query.listeningHabits.whenYouListen.queryOptions(),
  );
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const years = Object.keys(data)
    .map(Number)
    .sort((a, b) => a - b);

  const activeYear = selectedYear ?? years.at(-1) ?? new Date().getFullYear();
  const columns = data[activeYear] ?? [];

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-3">
        <span className="text-xs text-muted-foreground">When you listen</span>
        <div className="flex items-center justify-end gap-3">
          <HeatmapLegend
            align="end"
            cellSize={10}
            colorScale={colorScale}
            className="text-muted-foreground"
            interactive={false}
          />
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
        <HeatmapChart
          data={columns}
          margin={{ top: 24, right: 8, bottom: 0, left: 40 }}
          levelColors={LISTENING_HEATMAP_LEVEL_COLORS}
          colorScale={colorScale}
        >
          <HeatmapCells />
          <HeatmapXAxis />
          <HeatmapYAxis />
          <HeatmapTooltip formatLabel={formatTooltipLabel} />
        </HeatmapChart>
      </div>
    </div>
  );
}
