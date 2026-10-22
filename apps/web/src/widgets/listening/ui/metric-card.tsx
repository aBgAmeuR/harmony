import { ArrowExpandIcon, ChartColumnIcon, ChartLineData01Icon, Icon } from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";
import { Card } from "@harmony/ui/components/card";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import type { ListeningHabitTrendPoint } from "@/data/listening/types";
import type { Kind } from "@/utils/format";

import { calendarDaySpan } from "@/data/sql/period-range";
import { DataDialog, FigureViews } from "@/features/data-figure";
import { Spark } from "@/shared/primitives/spark";
import { Stat } from "@/shared/primitives/stat";
import { useScope } from "@/shared/scope";

import { listeningQueries } from "../api";
import { SeriesChart } from "./series-chart";

type ListeningMetricQuery = (typeof listeningQueries)[
  | "listeningTime"
  | "totalStreams"
  | "activeDays"
  | "uniqueTracks"];

type MetricCardProps = {
  label: string;
  kind?: Kind;
  query: ListeningMetricQuery;
};

const NO_TREND: ListeningHabitTrendPoint[] = [];

const VIEWS = [
  { value: "bars", label: "Bars", icon: ChartColumnIcon },
  { value: "area", label: "Area", icon: ChartLineData01Icon },
];

// Trend dates are midnight UTC, so they are read in UTC.
const bucketLabel = (date: Date, unit: "day" | "month") =>
  date.toLocaleDateString(
    "en-US",
    unit === "day"
      ? { month: "short", day: "numeric", timeZone: "UTC" }
      : { month: "short", year: "numeric", timeZone: "UTC" },
  );

// A metric with its trend, which opens larger.
export const MetricCard = ({ label, kind = "count", query }: MetricCardProps) => {
  const filter = useScope();
  const { data } = useQuery(query.queryOptions(filter));
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("bars");

  const trend = data?.trend ?? NO_TREND;
  // The trend is bucketed like the listening queries: by day under a month, by month above.
  const unit = calendarDaySpan(filter.from, filter.to) < 31 ? "day" : "month";
  const points = useMemo(
    () => trend.map((point) => ({ name: bucketLabel(point.date, unit), value: point.value })),
    [trend, unit],
  );

  return (
    <Card size="xs">
      <Stat>
        <Stat.Label>{label}</Stat.Label>
        <Stat.Value value={data?.value} kind={kind} />
        <Stat.Aside>
          <Button
            variant="ghost"
            size="icon-sm"
            className="-me-1 -mt-1"
            aria-label={`Expand ${label}`}
            onClick={() => setOpen(true)}
          >
            <Icon icon={ArrowExpandIcon} />
          </Button>
        </Stat.Aside>
      </Stat>
      <Spark data={trend.map((point) => point.value)} className="aspect-6/1 h-auto" />
      <DataDialog
        open={open}
        onOpenChange={setOpen}
        title={label}
        actions={<FigureViews views={VIEWS} value={view} onChange={setView} />}
      >
        <Stat className="p-0">
          <Stat.Label>Total for the period</Stat.Label>
          <Stat.Value value={data?.value} kind={kind} size="xl" />
        </Stat>
        <SeriesChart
          points={points}
          label={label}
          kind={kind}
          view={view === "area" ? "area" : "bars"}
          axis
          aspectRatio={2.5}
          ariaLabel={`${label} by ${unit}`}
        />
      </DataDialog>
    </Card>
  );
};
