import { Tooltip, TooltipContent, TooltipTrigger } from "@harmony/ui/components/tooltip";
import { useQuery } from "@tanstack/react-query";

import { trackQueries } from "@/entities/track";
import { Grid } from "@/shared/primitives/grid";
import { Meter } from "@/shared/primitives/meter";
import { Section } from "@/shared/primitives/section";
import { usePeriod } from "@/shared/scope";
import { format } from "@/utils/format";

type BehavioralWidgetProps = {
  trackId: number;
};

const formatTrackTime = (ms: number): string => {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const BehavioralWidget = ({ trackId }: BehavioralWidgetProps) => {
  const { from, to } = usePeriod();
  const { data } = useQuery(trackQueries.behavioral.queryOptions({ trackId, from, to }));

  const retention = data?.retention ?? [];
  const completeShare = data?.completeShare ?? 0;
  const avgSkipMs = data?.avgSkipMs ?? null;
  const trackDurationMs = data?.trackDurationMs ?? 0;
  const avgSkipPercent =
    avgSkipMs !== null && trackDurationMs > 0
      ? Math.min(100, (avgSkipMs / trackDurationMs) * 100)
      : null;

  return (
    <Section size="sm">
      <Section.Title>Behavioral</Section.Title>
      <Grid variant="ruled">
        <div className="flex flex-col gap-2 px-2.5 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-normal text-muted-foreground">Retention</p>
            <span className="text-xs font-medium">
              {format.as(completeShare, "percent")} Complete
            </span>
          </div>
          <Meter size="lg">
            {retention.map((segment) => (
              <Meter.Seg
                key={segment.key}
                value={segment.share}
                label={`${segment.label} · ${format.as(segment.share, "percent")}`}
                className={segment.colorClass}
              />
            ))}
          </Meter>
        </div>

        <div className="px-2.5 py-2.5">
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
      </Grid>
    </Section>
  );
};
