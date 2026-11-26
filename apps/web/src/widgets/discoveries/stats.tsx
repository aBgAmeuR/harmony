import type { DiscoverySummary } from "@/data/discoveries";

import { format } from "@/shared/lib/format";
import { Stat } from "@/shared/primitives/stat";

const hours = (minutes: number) => `${format.count(minutes / 60)}h`;

type StatsProps = {
  summary: DiscoverySummary;
  found: number;
  atRelease: number;
  returns: number;
};

export const DiscoveryStats = ({ summary, found, atRelease, returns }: StatsProps) => {
  const tiles = [
    {
      label: "New artists",
      value: found,
      kind: "count",
      hint: `of ${format.count(summary.artists)} played`,
    },
    {
      label: "Time on new artists",
      value: summary.minutes > 0 ? summary.newMinutes / summary.minutes : 0,
      kind: "percent",
      hint: `${hours(summary.newMinutes)} of ${hours(summary.minutes)}`,
    },
    {
      label: "New albums",
      value: summary.newAlbums,
      kind: "count",
      hint: `${format.count(atRelease)} heard at release`,
    },
    { label: "Back after a break", value: returns, kind: "count", hint: "silent a year or more" },
  ] as const;

  return (
    <div className="flex flex-wrap border-y border-border">
      {tiles.map((tile) => (
        <Stat
          key={tile.label}
          className="min-w-40 flex-1 gap-1.5 border-r border-border px-3 py-3 last:border-r-0"
        >
          <Stat.Label className="text-[11px]">{tile.label}</Stat.Label>
          <span className="flex items-baseline gap-1.5">
            <Stat.Value value={tile.value} kind={tile.kind} size="lg" />
            <Stat.Hint className="truncate text-[11px]">{tile.hint}</Stat.Hint>
          </span>
        </Stat>
      ))}
    </div>
  );
};
