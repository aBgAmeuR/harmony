import { intensity } from "@harmony/charts/v4";
import { cn } from "@harmony/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";

import { measures } from "@/data/measures";
import { format, platformLabel } from "@/shared/lib/format";
import { usePeriod } from "@/shared/scope";

import { detailQueries } from "./api";
import { Card, Foot, pts, ShareRow, Units, type PartProps } from "./kit";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SHADES = ["bg-chart-1", "bg-chart-4", "bg-chart-3", "bg-chart-5"];
const RATES = ["finishedRate", "completion", "skipRate", "shuffleRate"] as const;

const When = ({ filter }: PartProps) => {
  const { data: habits } = useQuery(detailQueries.habits(filter));
  const grid = habits?.grid ?? [];
  const max = Math.max(0, ...grid.flat());

  return (
    <Card title="When you listen" caption="time by weekday and hour">
      <div
        role="img"
        aria-label="Listening time by weekday and hour"
        className="flex flex-col gap-0.5"
      >
        {grid.map((row, index) => (
          <div key={WEEKDAYS[index]} className="flex items-center gap-0.5">
            <span className="w-7 shrink-0 text-[10px] text-muted-foreground">
              {WEEKDAYS[index]}
            </span>
            {row.map((value, hour) => (
              <span
                key={hour}
                className="h-3 flex-1 rounded-xs"
                style={{ background: intensity(value, max) }}
              />
            ))}
          </div>
        ))}
        <div className="flex pl-7.5 text-[10px] text-muted-foreground">
          {[0, 6, 12, 18].map((hour) => (
            <span key={hour} className="flex-1">
              {hour}h
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
};

const Context = ({ filter }: PartProps) => {
  const { data: platforms = [] } = useQuery(detailQueries.platforms(filter));
  const { data: stats } = useQuery(detailQueries.stats(filter));
  const count = (rate: number | undefined) =>
    stats && rate !== undefined ? format.count(Math.round(rate * stats.streams)) : "-";

  return (
    <Card title="Context" caption={`${stats ? format.count(stats.streams) : "-"} plays`}>
      <div className="flex h-1.5 gap-0.5">
        {platforms.map(({ platform, share }, index) => (
          <span
            key={platform}
            className={cn("rounded-full", SHADES[index % SHADES.length])}
            style={{ flexGrow: share, flexBasis: 0 }}
          />
        ))}
      </div>
      <div className="flex flex-wrap justify-between gap-x-3">
        {platforms.map(({ platform, share }) => (
          <span key={platform}>
            {platformLabel(platform)} <b>{format.as(share, "percent")}</b>
          </span>
        ))}
      </div>
      <Foot>
        <span>
          <b>{count(stats?.shuffleRate)}</b> on shuffle
        </span>
        <span>
          <b>{count(stats?.offlineRate)}</b> offline
        </span>
        <span>
          <b>{count(stats?.skipRate)}</b> skipped
        </span>
      </Foot>
    </Card>
  );
};

const Streams = ({ filter }: PartProps) => {
  const { data: behavior } = useQuery(detailQueries.behavior(filter));
  return (
    <Card title="Every 100 plays" caption="one square is 1%">
      <Units
        label="How plays end"
        parts={[
          { share: behavior?.complete ?? 0, label: "Heard through", className: "bg-chart-1" },
          { share: behavior?.partial ?? 0, label: "Cut short", className: "bg-chart-3" },
          { share: behavior?.quick ?? 0, label: "Dropped in a minute", className: "bg-chart-5" },
        ]}
      />
    </Card>
  );
};

const How = ({ filter }: PartProps) => {
  const period = usePeriod();
  const { data: stats } = useQuery(detailQueries.stats(filter));
  const { data: all } = useQuery(detailQueries.stats(period));
  const { data: behavior } = useQuery(detailQueries.behavior(filter));

  return (
    <Card title="How you listen" caption="against your average">
      <div>
        {RATES.map((key) => (
          <ShareRow
            key={key}
            label={measures[key].label}
            value={stats?.[key] ?? 0}
            mark={all?.[key]}
          >
            <b className="w-11">{stats ? format.as(stats[key], "percent") : "-"}</b>
            <span className="w-15 text-muted-foreground">
              {stats && all ? pts(stats[key] - all[key]) : "-"}
            </span>
          </ShareRow>
        ))}
      </div>
      <span className="text-[11px] text-muted-foreground">
        White tick: your average across everything
      </span>
      {typeof behavior?.skipPoint === "number" ? (
        <Foot>
          <span>
            Skips land at <b>{format.as(behavior.skipPoint, "percent")}</b> of the track
          </span>
        </Foot>
      ) : null}
    </Card>
  );
};

export const Habits = (part: PartProps) => (
  <>
    <When {...part} />
    <Context {...part} />
    <Streams {...part} />
    <How {...part} />
  </>
);
