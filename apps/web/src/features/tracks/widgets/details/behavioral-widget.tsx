import { Tooltip, TooltipContent, TooltipTrigger } from "@harmony/ui/components/tooltip";
import { cn } from "@harmony/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";

import { query } from "@/lib/query";
import { useInstantRangeQuery } from "@/lib/stores/date-range-store";

type BehavioralWidgetProps = {
  trackId: number;
};

function formatTrackTime(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export const BehavioralWidget = ({ trackId }: BehavioralWidgetProps) => {
  const { from, to } = useInstantRangeQuery();
  const { data } = useQuery(query.tracks.behavioral.queryOptions({ trackId, from, to }));

  const retention = data?.retention ?? [];
  const completePercentage = data?.completePercentage ?? 0;
  const avgSkipMs = data?.avgSkipMs ?? null;
  const trackDurationMs = data?.trackDurationMs ?? 0;
  const avgSkipPercent =
    avgSkipMs !== null && trackDurationMs > 0
      ? Math.min(100, (avgSkipMs / trackDurationMs) * 100)
      : null;

  return (
    <section className="flex flex-col gap-1.5">
      <p className="text-xs font-normal text-muted-foreground">Behavioral</p>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-2 px-2.5 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-normal text-muted-foreground">Retention</p>
            <span className="text-xs font-medium">{completePercentage}% Complete</span>
          </div>
          <div className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full">
            {retention.map((segment) => (
              <Tooltip key={segment.key}>
                <TooltipTrigger
                  className={cn("h-full min-w-0 rounded-sm", segment.colorClass)}
                  style={{ flexGrow: Math.max(segment.percentage, 0), flexBasis: 0 }}
                />
                <TooltipContent>
                  <p>
                    {segment.label} · {segment.percentage}%
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>

        <div className="border-t border-border px-2.5 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-normal text-muted-foreground">Average Skip</p>
            <span className="text-xs font-medium text-destructive">
              {avgSkipMs !== null ? formatTrackTime(avgSkipMs) : "-"}
            </span>
          </div>
          <div className="mt-2 flex flex-col gap-1">
            <div className="relative h-2 w-full rounded-full bg-muted">
              {avgSkipPercent !== null ? (
                <Tooltip>
                  <TooltipTrigger
                    className="absolute top-1/2 z-10 h-3.5 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-destructive"
                    style={{ left: `${avgSkipPercent}%` }}
                  />
                  <TooltipContent>
                    <p>Avg skip · {formatTrackTime(avgSkipMs ?? 0)}</p>
                  </TooltipContent>
                </Tooltip>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
