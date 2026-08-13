import { useQuery } from "@tanstack/react-query";

import { Cover } from "@/components/cover";
import { useFilter } from "@/lib/filter";
import { query } from "@/lib/query";

import { formatMilestoneDate } from "../format";

export function FirstsWidget() {
  const filter = useFilter();
  const { data = [], isPending } = useQuery(query.milestones.firsts.queryOptions(filter));

  return (
    <section className="min-w-0 space-y-3" aria-labelledby="discoveries-that-stayed">
      <header>
        <h2 id="discoveries-that-stayed" className="text-base font-semibold tracking-tight">
          Discoveries that stayed
        </h2>
        <p className="text-xs text-pretty text-muted-foreground">
          Artists you first heard in this range, now in your top 50.
        </p>
      </header>
      {!isPending && data.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No top-50 artists were first heard in this range.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((row) => (
            <li key={row.id} className="flex items-center gap-3">
              <Cover src={row.image} alt={row.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{row.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {formatMilestoneDate(row.date)}
                </p>
              </div>
              <p className="shrink-0 text-sm font-medium text-primary">#{row.laterRank}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
