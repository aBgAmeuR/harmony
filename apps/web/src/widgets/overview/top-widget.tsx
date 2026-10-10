import { Card } from "@harmony/ui/components/card";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import type { RankBy, RankRow } from "@/data/rank";

import { format } from "@/utils/format";

import { overviewQueries } from "./api";
import { Picture } from "./ui/picture";
import { Playtime } from "./ui/playtime";
import { useRanges } from "./use-range";

type TopWidgetProps = {
  by: RankBy;
};

const config = {
  artist: { title: "Top artists", to: "./artists", query: overviewQueries.topArtists },
  album: { title: "Top albums", to: "./albums", query: overviewQueries.topAlbums },
  track: { title: "Top tracks", to: "./tracks", query: overviewQueries.topTracks },
} as const;

export const TopWidget = ({ by }: TopWidgetProps) => {
  const { range, full } = useRanges();
  const { title, to, query } = config[by];
  const { data = [] } = useQuery(query.queryOptions(range));
  const { data: overview } = useQuery(overviewQueries.kpis.queryOptions(range, full));

  const total = overview?.current.totals.minutes ?? 0;
  const [first, ...rest] = data;

  const subtitle = (row: RankRow): string | null =>
    by === "artist"
      ? total > 0
        ? `${((row.playtime / total) * 100).toFixed(1)}% of total`
        : null
      : row.description;

  return (
    <section className="flex min-w-0 flex-col gap-3 text-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        <Link
          from="/app/$packageId"
          to={to}
          preload="intent"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          View all
        </Link>
      </div>

      {first ? (
        <Card className="flex-row items-center gap-3 p-0 pr-3">
          <Picture src={first.image} name={first.name} size="xl" className="rounded-r-none" />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-base font-semibold tracking-tight">{first.name}</span>
            <span className="truncate text-xs text-muted-foreground">{subtitle(first)}</span>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-0.5">
            <Playtime minutes={first.playtime} className="text-base" />
            <span className="text-xs text-muted-foreground tabular-nums">
              {format.count(first.streams)} streams
            </span>
          </div>
        </Card>
      ) : (
        <p className="py-6 text-center text-muted-foreground">Nothing here yet.</p>
      )}

      {rest.length > 0 ? (
        <div className="flex flex-col">
          <ol className="flex flex-col divide-y divide-border">
            {rest.map((row, i) => (
              <li key={row.id} className="flex h-12 items-center gap-2">
                <span className="w-4 text-center text-muted-foreground tabular-nums">{i + 2}</span>
                <Picture src={row.image} name={row.name} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium text-foreground">{row.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{subtitle(row)}</span>
                </div>
                <span className="w-12 text-right text-foreground tabular-nums">
                  {format.count(row.streams)}
                </span>
                <span className="w-20 text-right">
                  <Playtime minutes={row.playtime} />
                </span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
};
