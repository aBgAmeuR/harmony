import { useQuery } from "@tanstack/react-query";

import { useScope } from "@/shared/scope";

import { milestoneQueries } from "./api";
import { formatLongDate, heroHeadline } from "./format";

export const SummaryHero = () => {
  const filter = useScope();
  const { data, isPending } = useQuery(milestoneQueries.summary.queryOptions(filter));

  return (
    <header className="min-w-0 space-y-1">
      <p className="text-xs text-muted-foreground">
        {isPending
          ? "Since…"
          : data?.rangeStart
            ? `Since ${formatLongDate(data.rangeStart)}`
            : "Since the first play"}
      </p>
      <p className="text-xl font-semibold tracking-tight text-pretty tabular-nums">
        {data ? heroHeadline(data.listeningDays, data.streams) : "Listening days and streams…"}
      </p>
    </header>
  );
};
