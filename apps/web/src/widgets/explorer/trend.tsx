import { AreaChart } from "@harmony/charts/v4";

import type { ExplorerTrendPoint } from "@/data/explorer/trends";

import { toSqlDate } from "@/data/sql/date-range";
import { measure } from "@/shared/lib/measure";

import type { ExplorerSort } from "./search";

export type TrendUnit = "day" | "month";

const day = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const month = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" });

const parse = (label: string): Date => new Date(`${label}T00:00:00`);

type TrendProps = {
  name: string;
  points: ExplorerTrendPoint[];
  sort: ExplorerSort;
  unit: TrendUnit;
  // Upper bound shared by every row of the table.
  max: number;
  onPickMonth: (date: Date) => void;
};

export const valueOf = (point: ExplorerTrendPoint, sort: ExplorerSort): number =>
  sort === "playtime" ? point.playtime : point.streams;

export const ExplorerTrend = ({ name, points, sort, unit, max, onPickMonth }: TrendProps) => {
  const rows = points.map((point) => ({
    label: toSqlDate(point.date),
    value: valueOf(point, sort),
  }));

  return (
    <AreaChart
      data={rows}
      x="label"
      height={28}
      margin={2}
      yMax={Math.max(max, 1)}
      ariaLabel={`${name}, ${unit === "day" ? "daily" : "monthly"} listening`}
      onSelect={unit === "month" ? (label) => onPickMonth(parse(label)) : undefined}
    >
      <AreaChart.Area dataKey="value" label={measure[sort].label} />
      <AreaChart.Tooltip
        suffix={sort === "playtime" ? " min" : " streams"}
        title={(label) => (unit === "day" ? day : month).format(parse(label))}
      />
    </AreaChart>
  );
};
