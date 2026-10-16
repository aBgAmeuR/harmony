import { cn } from "@harmony/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";

import { format } from "@/utils/format";

import { overviewQueries } from "./api";
import { percent } from "./format";
import { Meter } from "./ui/meter";
import { Panel } from "./ui/panel";
import { useRanges } from "./use-range";

export const BehaviorWidget = () => {
  const { range } = useRanges();
  const { data } = useQuery(overviewQueries.behavior.queryOptions(range));

  if (!data) return <Panel title="How streams end">{null}</Panel>;

  const { streams, finished, skipped } = data;
  const partly = Math.max(streams - finished - skipped, 0);

  const segments = [
    { label: "Finished", value: finished, tone: "bg-chart-1" },
    { label: "Partly heard", value: partly, tone: "bg-chart-3" },
    { label: "Skipped", value: skipped, tone: "bg-foreground/25" },
  ];

  return (
    <Panel title="How streams end">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-semibold tracking-tight tabular-nums">
              {percent(finished, streams)}%
            </span>
            <span className="text-muted-foreground">played to the end</span>
          </div>
          <div className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-muted">
            {segments.map((s) => (
              <div
                key={s.label}
                className={s.tone}
                style={{ width: `${streams > 0 ? (s.value / streams) * 100 : 0}%` }}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
            {segments.map((s) => (
              <span key={s.label} className="flex items-center gap-1.5">
                <span className={cn("size-2 rounded-full", s.tone)} />
                {s.label}
                <span className="text-foreground tabular-nums">{percent(s.value, streams)}%</span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1 border-t pt-3">
          <span className="pb-1 text-muted-foreground">Playback</span>
          <Meter label="Shuffle" value={percent(data.shuffle, streams)} />
          <Meter label="Offline" value={percent(data.offline, streams)} />
          <Meter label="Skip rate" value={percent(skipped, streams)} />
        </div>

        <div className="flex flex-col gap-1 border-t pt-3">
          <div className="flex items-center justify-between pb-1 text-muted-foreground">
            Platforms
            <span className="font-mono">{format.count(streams)} streams</span>
          </div>
          {data.platforms.slice(0, 5).map((p) => (
            <Meter key={p.label} label={p.label} value={percent(p.value, streams)} />
          ))}
        </div>
      </div>
    </Panel>
  );
};
