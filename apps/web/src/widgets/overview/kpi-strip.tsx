import { Skeleton } from "@harmony/ui/components/skeleton";
import { cn } from "@harmony/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";

import { measures } from "@/data/measures";
import { Delta } from "@/shared/primitives/delta";
import { Empty } from "@/shared/primitives/empty";
import { Stat } from "@/shared/primitives/stat";

import { overviewQueries } from "./api";
import { delta } from "./format";
import { useRanges } from "./use-range";

const KPIS = [
  { key: "minutes", ...measures.playtime },
  { key: "streams", ...measures.streams },
  { key: "artists", ...measures.artists },
  { key: "days", ...measures.days },
] as const;

export const KpiStrip = () => {
  const { range, full } = useRanges();
  const { data } = useQuery(overviewQueries.kpis({ range, full }));

  if (data?.current.totals.streams === 0) {
    return (
      <Empty variant="framed" className="py-10">
        No listening in this period.
      </Empty>
    );
  }

  return (
    <div className="@container">
      <div className="grid grid-cols-2 gap-3 @2xl:grid-cols-4">
        {KPIS.map(({ key, label, kind }) => {
          const change = data ? delta(data.current.totals[key], data.previous.totals[key]) : null;
          const up = change !== null && change > 0;
          return (
            <Stat key={key} className="gap-0 rounded-lg border bg-card px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <Stat.Label>{label}</Stat.Label>
                {data ? (
                  <Delta
                    value={change}
                    tone={up ? "auto" : "muted"}
                    className={cn("rounded-md px-1.5 py-0.5", up ? "bg-chart-1/15" : "bg-muted")}
                  />
                ) : null}
              </div>
              {data ? (
                <Stat.Value value={data.current.totals[key]} kind={kind} size="lg" />
              ) : (
                <Skeleton className="h-6 w-20" />
              )}
            </Stat>
          );
        })}
      </div>
    </div>
  );
};
