import { ArrowRight01Icon, Icon } from "@harmony/icons";
import { Card } from "@harmony/ui/components/card";
import { Skeleton } from "@harmony/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

import type { RankBy, RankRow } from "@/data/rank";

import { FigureViews } from "@/features/data-figure";
import { Art } from "@/shared/primitives/art";
import { Empty } from "@/shared/primitives/empty";
import { Media } from "@/shared/primitives/media";
import { Num } from "@/shared/primitives/num";
import { Rank } from "@/shared/primitives/rank";
import { Section } from "@/shared/primitives/section";
import { Table } from "@/shared/primitives/table";

import { overviewQueries } from "./api";
import { useRanges } from "./use-range";

const TABS = [
  { value: "track", label: "Tracks" },
  { value: "album", label: "Albums" },
  { value: "artist", label: "Artists" },
];

const isBy = (value: string): value is RankBy =>
  value === "track" || value === "album" || value === "artist";

const config = {
  track: {
    noun: "track",
    to: "./tracks",
    all: "View all tracks",
    open: "Track details",
    query: overviewQueries.topTracks,
  },
  album: {
    noun: "album",
    to: "./albums",
    all: "View all albums",
    open: "Album page",
    query: overviewQueries.topAlbums,
  },
  artist: {
    noun: "artist",
    to: "./artists",
    all: "View all artists",
    open: "Artist profile",
    query: overviewQueries.topArtists,
  },
} as const;

type TopWidgetProps = {
  // The track open in the side panel.
  selectedId?: number;
  onOpen: (by: RankBy, row: RankRow) => void;
};

// The number one large, then the top five with their listening time against the leader's.
export const TopWidget = ({ selectedId, onOpen }: TopWidgetProps) => {
  const [by, setBy] = useState<RankBy>("track");
  const { range } = useRanges();
  const { to, all, open, noun, query } = config[by];
  const { data = [], isPending } = useQuery(query.queryOptions(range));
  const { data: artists = [] } = useQuery(overviewQueries.topArtists.queryOptions(range));
  const { data: tracks = [] } = useQuery(overviewQueries.topTracks.queryOptions(range));

  const leader = data[0];
  const most = Math.max(0, ...data.map((row) => row.playtime));
  const artist = artists[0];
  const track = tracks[0];

  return (
    <Section size="md">
      <Section.Title>On repeat</Section.Title>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        {!artist && isPending ? (
          <Skeleton className="h-5 w-80 max-w-full" />
        ) : (
          <Section.Text>
            {artist && track ? (
              <>
                <strong>{artist.name}</strong> was your top artist, and{" "}
                <strong>{track.name}</strong>
                {track.description ? <> by {track.description}</> : null} your top track.
              </>
            ) : (
              "Your most played music in this period."
            )}
          </Section.Text>
        )}
        <FigureViews
          views={TABS}
          value={by}
          onChange={(next) => {
            if (isBy(next)) setBy(next);
          }}
        />
      </div>

      {isPending ? (
        <Skeleton className="mt-3 h-78 rounded-lg" />
      ) : !leader ? (
        <Empty variant="framed" className="mt-3">
          Nothing played in this period.
        </Empty>
      ) : (
        <div className="mt-3 grid gap-4 md:grid-cols-[13rem_minmax(0,1fr)]">
          <Card size="xs" className="gap-3 p-3">
            <Art
              src={leader.cover ?? leader.image}
              alt={leader.name}
              size="2xl"
              fallback="initials"
              className="aspect-square size-auto w-full"
            />
            <div className="mt-auto flex min-w-0 flex-col gap-0.5 px-1 pb-1">
              <span className="text-xs text-muted-foreground">Top {noun}</span>
              <span className="truncate text-base font-semibold">{leader.name}</span>
              {leader.description ? (
                <span className="truncate text-xs text-muted-foreground">{leader.description}</span>
              ) : null}
              <button
                type="button"
                onClick={() => onOpen(by, leader)}
                className="mt-2 flex w-fit items-center gap-1 text-xs text-primary transition-colors hover:text-foreground"
              >
                {open}
                <Icon icon={ArrowRight01Icon} size={12} />
              </button>
            </div>
          </Card>

          <div className="flex min-w-0 flex-col gap-2">
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.Col className="w-8 text-center">#</Table.Col>
                  <Table.Col>{TABS.find((tab) => tab.value === by)?.label.slice(0, -1)}</Table.Col>
                  <Table.Col className="hidden w-1/4 sm:table-cell">Time</Table.Col>
                  <Table.Col className="w-14 text-right">Plays</Table.Col>
                  <Table.Col className="w-20 text-right" />
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {data.map((row, index) => (
                  <Table.Row
                    key={row.id}
                    selected={by === "track" && row.id === selectedId}
                    onSelect={() => onOpen(by, row)}
                  >
                    <Table.Cell className="text-center">
                      <Rank n={index + 1} />
                    </Table.Cell>
                    <Table.Cell className="max-w-0">
                      <Media>
                        <Media.Art src={row.image} alt={row.name} fallback="initials" />
                        <Media.Body>
                          <Media.Title>{row.name}</Media.Title>
                          {row.description ? <Media.Sub>{row.description}</Media.Sub> : null}
                        </Media.Body>
                      </Media>
                    </Table.Cell>
                    <Table.Cell className="hidden sm:table-cell">
                      <span
                        aria-hidden
                        className="block h-1.5 overflow-hidden rounded-full bg-muted"
                      >
                        <span
                          className="block h-full rounded-full bg-chart-1"
                          style={{ width: `${most > 0 ? (row.playtime / most) * 100 : 0}%` }}
                        />
                      </span>
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      <Num value={row.streams} />
                    </Table.Cell>
                    <Table.Cell className="text-right text-muted-foreground">
                      <Num value={row.playtime} kind="minutes" />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
            <Link
              from="/app/$packageId"
              to={to}
              preload="intent"
              className="flex w-fit items-center gap-1 px-2 text-xs text-primary transition-colors hover:text-foreground"
            >
              {all}
              <Icon icon={ArrowRight01Icon} size={12} />
            </Link>
          </div>
        </div>
      )}
    </Section>
  );
};
