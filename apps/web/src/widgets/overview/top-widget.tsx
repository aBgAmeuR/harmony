import { Card } from "@harmony/ui/components/card";
import { Skeleton } from "@harmony/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import type { RankBy, RankRow } from "@/data/rank";

import { Empty } from "@/shared/primitives/empty";
import { Media } from "@/shared/primitives/media";
import { Num } from "@/shared/primitives/num";
import { Rank } from "@/shared/primitives/rank";
import { Section } from "@/shared/primitives/section";
import { Table } from "@/shared/primitives/table";
import { format } from "@/utils/format";

import { overviewQueries } from "./api";
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
  const { data = [], isPending } = useQuery(query.queryOptions(range));
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
    <Section>
      <Section.Head>
        <Section.Title>{title}</Section.Title>
        <Section.Action>
          <Link
            from="/app/$packageId"
            to={to}
            preload="intent"
            className="transition-colors hover:text-foreground"
          >
            View all
          </Link>
        </Section.Action>
      </Section.Head>

      {isPending ? (
        <>
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </>
      ) : first ? (
        <Card className="p-0 pr-3">
          <Media size="lg">
            <Media.Art src={first.image} alt={first.name} fallback="initials" />
            <Media.Body>
              <Media.Title>{first.name}</Media.Title>
              <Media.Sub>{subtitle(first)}</Media.Sub>
            </Media.Body>
            <Media.End className="flex-col items-end gap-0.5">
              <Num value={first.playtime} kind="minutes" size="md" />
              <span className="text-xs text-muted-foreground tabular-nums">
                {format.count(first.streams)} streams
              </span>
            </Media.End>
          </Media>
        </Card>
      ) : (
        <Empty>Nothing here yet.</Empty>
      )}

      {rest.length > 0 ? (
        <Table>
          <Table.Body>
            {rest.map((row, i) => (
              <Table.Row key={row.id}>
                <Table.Cell className="w-6">
                  <Rank n={i + 2} variant="plain" />
                </Table.Cell>
                <Table.Cell className="max-w-0">
                  <Media>
                    <Media.Art src={row.image} alt={row.name} fallback="initials" />
                    <Media.Body>
                      <Media.Title>{row.name}</Media.Title>
                      <Media.Sub>{subtitle(row)}</Media.Sub>
                    </Media.Body>
                  </Media>
                </Table.Cell>
                <Table.Cell className="w-12 text-right">
                  <Num value={row.streams} />
                </Table.Cell>
                <Table.Cell className="w-20 text-right">
                  <Num value={row.playtime} kind="minutes" />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      ) : null}
    </Section>
  );
};
