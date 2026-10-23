import { Skeleton } from "@harmony/ui/components/skeleton";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import type { Unit } from "@/data/overview/range";

import { Empty } from "@/shared/primitives/empty";

import { overviewQueries } from "./api";
import { periodNames } from "./format";
import { KpiOverview } from "./kpi-overview";
import { useRanges } from "./use-range";

// Loads the period's totals and curves, then draws them with `KpiOverview`.
export const KpiChartWidget = () => {
  const { packageId } = useParams({ from: "/app/$packageId" });
  const { range, full } = useRanges();
  const [picked, setPicked] = useState<Unit | undefined>(undefined);
  const { data } = useQuery({
    ...overviewQueries.kpis.queryOptions(range, full, picked),
    // The previous unit stays on screen while the next one loads.
    placeholderData: keepPreviousData,
  });
  const names = useMemo(() => periodNames(full), [full]);

  // Same height as the loaded widget: the four KPI tabs, then the chart card.
  if (!data) {
    return (
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-84 rounded-lg" />
      </div>
    );
  }
  if (data.current.totals.streams === 0) {
    return (
      <Empty variant="framed" className="py-10">
        No listening in this period.
      </Empty>
    );
  }

  return <KpiOverview data={data} names={names} packageId={packageId} onUnitChange={setPicked} />;
};
