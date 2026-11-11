import { ArrowExpandIcon, ChartColumnIcon, ChartLineData01Icon, Icon } from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";
import { Card } from "@harmony/ui/components/card";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { measures } from "@/data/measures";
import { DataDialog, FigureViews } from "@/features/data-figure";
import { parseDay } from "@/shared/lib/date";
import { Spark } from "@/shared/primitives/spark";
import { Stat } from "@/shared/primitives/stat";
import { useScope } from "@/shared/scope";

import type { Point } from "../api";

import { listeningQueries, type MetricId } from "../api";
import { SeriesChart } from "./series-chart";

type MetricCardProps = { measure: MetricId };

const NO_TREND: Point[] = [];

const VIEWS = [
  { value: "bars", label: "Bars", icon: ChartColumnIcon },
  { value: "area", label: "Area", icon: ChartLineData01Icon },
];

const bucketLabel = (start: string, unit: "day" | "week" | "month") =>
  parseDay(start).toLocaleDateString(
    "en-US",
    unit === "month" ? { month: "short", year: "numeric" } : { month: "short", day: "numeric" },
  );

// A metric with its trend, which opens larger.
export const MetricCard = ({ measure }: MetricCardProps) => {
  const { label, kind } = measures[measure];
  const scope = useScope();
  const { data } = useQuery(listeningQueries.metric({ scope, measure }));
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("bars");

  const trend = data?.trend ?? NO_TREND;
  const unit = data?.unit ?? "day";
  const points = useMemo(
    () => trend.map((point) => ({ name: bucketLabel(point.start, unit), value: point.value })),
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
