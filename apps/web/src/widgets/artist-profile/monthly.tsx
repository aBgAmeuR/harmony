import { BarChart } from "@harmony/charts/v4";
import { Button } from "@harmony/ui/components/button";
import { useQuery } from "@tanstack/react-query";

import { toSqlDate } from "@/data/sql/date-range";
import { artistQueries } from "@/entities/artist";
import { Section } from "@/shared/primitives/section";
import { useDateRangeStore, usePeriod } from "@/shared/scope";

const ACTIVE = "var(--chart-1)";
const DIMMED = "color-mix(in srgb, var(--chart-1) 30%, transparent)";

const short = new Intl.DateTimeFormat("en-US", { month: "short" });
const long = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });

const parse = (label: string): Date => new Date(`${label}T00:00:00`);

type MonthlyProps = {
  artistId: number;
};

// Listening of the artist month by month. It always spans the year (or the custom range) around
// the period, so a single month still shows where it sits. A bar is a way to zoom to its month.
export const Monthly = ({ artistId }: MonthlyProps) => {
  const mode = useDateRangeStore((s) => s.mode);
  const { from, to } = usePeriod();

  const span =
    mode === "custom"
      ? { from, to }
      : { from: new Date(from.getFullYear(), 0, 1), to: new Date(from.getFullYear(), 11, 31) };
  const { data = [] } = useQuery(artistQueries.monthly.queryOptions({ artistId, ...span }));

  const first = toSqlDate(new Date(from.getFullYear(), from.getMonth(), 1));
  const last = toSqlDate(to);
  const rows = data.map((month) => ({
    label: month.month,
    value: month.playtime,
    active: month.month >= first && month.month <= last,
  }));

  const pick = (label: string) => {
    const { setMode, setCursor } = useDateRangeStore.getState();
    setMode("month");
    setCursor(parse(label));
  };

  return (
    <Section className="rounded-lg border border-border bg-card p-3">
      <Section.Head>
        <Section.Title>Monthly activity</Section.Title>
        {mode === "month" ? (
          <Section.Action>
            <Button variant="outline" onClick={() => useDateRangeStore.getState().setMode("year")}>
              Show {from.getFullYear()}
            </Button>
          </Section.Action>
        ) : null}
      </Section.Head>
      <BarChart data={rows} x="label" aspectRatio={5} ariaLabel="Monthly listening" onSelect={pick}>
        <BarChart.Bar
          dataKey="value"
          label="Time listened"
          color={(row) => (row.active ? ACTIVE : DIMMED)}
        />
        <BarChart.XAxis format={(label) => short.format(parse(label))} />
        <BarChart.YAxis ticks={3} />
        <BarChart.Grid />
        <BarChart.Tooltip suffix=" min" title={(label) => long.format(parse(label))} />
      </BarChart>
    </Section>
  );
};
