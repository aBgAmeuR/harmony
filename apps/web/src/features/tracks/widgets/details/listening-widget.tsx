import { Bar, BarChart, ChartTooltip, Grid, XAxis } from "@harmony/charts/v2";
import { Tooltip, TooltipContent, TooltipTrigger } from "@harmony/ui/components/tooltip";
import { useQuery } from "@tanstack/react-query";

import type { ListeningDayPart } from "@/features/tracks/queries/listening";

import { query } from "@/lib/query";
import { useInstantRangeQuery } from "@/lib/stores/date-range-store";

type ListeningWidgetProps = {
  trackId: number;
};

export const ListeningWidget = ({ trackId }: ListeningWidgetProps) => {
  const { from, to } = useInstantRangeQuery();
  const { data } = useQuery(query.tracks.listening.queryOptions({ trackId, from, to }));

  const monthly = data?.monthly ?? [];
  const weekly = data?.weekly ?? [];
  const dayParts = data?.dayParts ?? [];
  const peakDayPart = dayParts.reduce<ListeningDayPart | null>(
    (peak, part) => (!peak || part.percentage > peak.percentage ? part : peak),
    null,
  );

  return (
    <section className="flex flex-col gap-1.5">
      <p className="text-xs font-normal text-muted-foreground">Listening</p>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="px-2.5 pt-4 pb-0">
          <BarChart className="aspect-[5/2]" data={monthly} xDataKey="name">
            <Bar dataKey="value" fill="var(--chart-2)" />
            <Grid />
            <XAxis />
            <ChartTooltip suffix="min" />
          </BarChart>
        </div>

        <div className="border-t border-border px-2.5 pt-2.5 pb-0">
          <p className="text-xs font-normal text-muted-foreground">Weekly</p>
          <BarChart className="aspect-[5/1]" data={weekly} xDataKey="name">
            <Bar dataKey="value" fill="var(--chart-2)" />
            <Grid />
            <XAxis />
            <ChartTooltip />
          </BarChart>
        </div>

        <div className="flex flex-col gap-2 border-t border-border px-2.5 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-normal text-muted-foreground">Time of day</p>
            {peakDayPart && peakDayPart.percentage > 0 ? (
              <span className="text-xs font-medium">
                {peakDayPart.percentage}% {peakDayPart.label}
              </span>
            ) : null}
          </div>
          <div className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full">
            {dayParts.map((part, index) => (
              <Tooltip key={part.key}>
                <TooltipTrigger
                  className="h-full min-w-0 rounded-sm bg-primary"
                  style={{
                    flexGrow: Math.max(part.percentage, 0),
                    flexBasis: 0,
                    opacity: 1 - index * 0.18,
                  }}
                />
                <TooltipContent>
                  <p>
                    {part.label} · {part.percentage}%
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
