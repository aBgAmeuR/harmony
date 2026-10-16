import { BarChart, Heatmap } from "@harmony/charts/v4";
import { cn } from "@harmony/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";

import { format } from "@/utils/format";

import { overviewQueries } from "./api";
import { Panel } from "./ui/panel";
import { useRanges } from "./use-range";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, "0"));
const HOUR_TICKS = ["00", "06", "12", "18"];
const LEGEND = ["bg-muted", "bg-chart-4", "bg-chart-3", "bg-chart-2", "bg-chart-1"];
const SCALE = ["var(--chart-4)", "var(--chart-3)", "var(--chart-2)", "var(--chart-1)"];

// The two charts share this left margin so their columns line up.
const MARGIN = { left: 32, right: 0, top: 0, bottom: 0 };
const HEATMAP_MARGIN = { ...MARGIN, bottom: 20 };

export const HabitsWidget = () => {
  const { range } = useRanges();
  const { data } = useQuery(overviewQueries.habits.queryOptions(range));

  const grid = data?.grid ?? [];
  const cells = DAYS.flatMap((day, d) =>
    HOURS.map((hour, h) => ({ day, hour, value: grid[d]?.[h] ?? 0 })),
  );
  const byHour = HOURS.map((hour, h) => ({
    hour,
    value: grid.reduce((sum, row) => sum + (row[h] ?? 0), 0),
  }));
  const maxHour = Math.max(...byHour.map((row) => row.value), 0);
  const peakHour = byHour.find((row) => row.value === maxHour)?.hour;

  const hourColor = (row: Record<string, unknown>): string => {
    const value = typeof row.value === "number" ? row.value : 0;
    const index = Math.min(
      SCALE.length - 1,
      Math.floor((value / Math.max(maxHour, 1)) * SCALE.length),
    );
    return SCALE[index] ?? "var(--chart-1)";
  };

  return (
    <Panel
      title="When you listen"
      action={
        <span className="flex items-center gap-1.5 text-xs">
          Less
          {LEGEND.map((tone) => (
            <span key={tone} className={cn("size-2.5 rounded-xs", tone)} />
          ))}
          More
        </span>
      }
    >
      <div className="flex flex-col gap-4">
        <Heatmap
          data={cells}
          x="hour"
          y="day"
          value="value"
          xDomain={HOURS}
          yDomain={DAYS}
          xTicks={HOUR_TICKS}
          valueLabel="Streams"
          format={format.count}
          title={(hour, day) => `${day} ${hour}:00`}
          ariaLabel="Streams by weekday and hour"
          height={160}
          margin={HEATMAP_MARGIN}
        />

        <div className="flex flex-col gap-2 border-t pt-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Streams by hour</span>
            {maxHour > 0 ? (
              <span className="font-mono text-muted-foreground">Peak {peakHour}:00</span>
            ) : null}
          </div>
          <BarChart
            data={byHour}
            x="hour"
            ariaLabel="Streams by hour of the day"
            height={96}
            margin={MARGIN}
          >
            <BarChart.Bar dataKey="value" label="Streams" color={hourColor} />
            <BarChart.Tooltip title={(hour) => `${hour}:00`} format={format.count} />
          </BarChart>
        </div>
      </div>
    </Panel>
  );
};
