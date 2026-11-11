import type { ReactNode } from "react";

import { ArrowRight01Icon, Icon } from "@harmony/icons";
import { buttonVariants } from "@harmony/ui/components/button";
import { Card } from "@harmony/ui/components/card";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { useState } from "react";

import type { ViewState } from "@/widgets/base/view";

import { bases, type BaseId } from "@/data/bases";
import { itemRule, type ItemRef } from "@/data/items";
import { measures } from "@/data/measures";
import { useTrackPanel } from "@/features/track-panel";
import { Crumbs } from "@/shared/primitives/crumbs";
import { Empty } from "@/shared/primitives/empty";
import { Grid } from "@/shared/primitives/grid";
import { Media } from "@/shared/primitives/media";
import { Meta } from "@/shared/primitives/meta";
import { Section } from "@/shared/primitives/section";
import { Stat } from "@/shared/primitives/stat";
import { usePeriod } from "@/shared/scope";
import { BaseView } from "@/widgets/base/base-view";
import { Page } from "@/widgets/page/page";
import { TrackSheet } from "@/widgets/track-details/track-sheet";

import { itemQueries } from "./api";
import { Monthly } from "./monthly";

const BASE_OF = { artist: "artists", album: "albums", genre: "genres", track: "tracks" } as const;

type ItemBaseProps = { title: string; item: ItemRef; initial: ViewState & { base: BaseId } };

// A base of the package narrowed to the item, such as the tracks of an artist. Its view is local.
export const ItemBase = ({ title, item, initial }: ItemBaseProps) => {
  const [state, setState] = useState<ViewState>(initial);
  const { trackId } = useTrackPanel();
  // Albums are listed by their own artists, not by the artists heard on them.
  const fixed =
    item.kind === "artist" && initial.base === "albums"
      ? [{ ...itemRule(item), field: "albumArtist" as const }]
      : [itemRule(item)];
  return (
    <Section>
      <Section.Title>{title}</Section.Title>
      <BaseView
        state={state}
        onChange={(patch) => setState((prev) => ({ ...prev, ...patch }))}
        fixed={fixed}
        limit={10}
        selectedId={trackId}
      />
    </Section>
  );
};

type ItemPageProps = { item: ItemRef; children?: ReactNode };

// The page of an artist, an album or a genre: what it is, how much it was played, then its bases.
export const ItemPage = ({ item, children }: ItemPageProps) => {
  const { packageId = "" } = useParams({ strict: false });
  const period = usePeriod();
  const rule = itemRule(item);
  const base = BASE_OF[item.kind];

  const { data: info, isLoading } = useQuery(itemQueries.info(item));
  const { data: stats } = useQuery(itemQueries.stats({ ...period, rules: [rule] }));

  const title = (
    <Crumbs>
      <Crumbs.Item
        render={<Link to="/app/$packageId/explorer" params={{ packageId }} search={{}} />}
      >
        Explorer
      </Crumbs.Item>
      <Crumbs.Item
        render={<Link to="/app/$packageId/explorer" params={{ packageId }} search={{ base }} />}
      >
        {bases[base].title}
      </Crumbs.Item>
      <Crumbs.Here>{info?.name ?? ""}</Crumbs.Here>
    </Crumbs>
  );

  if (!isLoading && !info) {
    return (
      <Page title={title}>
        <Empty className="py-8">This {item.kind} is not in the package.</Empty>
      </Page>
    );
  }

  const year = info?.releaseDate?.slice(0, 4);
  const tracks =
    item.kind === "album" ? `${stats?.tracks ?? 0} / ${info?.trackCount ?? 0}` : undefined;

  return (
    <Page title={title} className="flex flex-col gap-8" aside={<TrackSheet />}>
      <Media size="xl">
        <Media.Art
          src={info?.image}
          alt={info?.name ?? ""}
          variant="glow"
          fallback={item.kind === "album" ? "icon" : "initials"}
        />
        <Media.Body className="gap-1">
          <span className="text-xs text-muted-foreground capitalize">
            {info?.type ?? item.kind}
          </span>
          <Media.Title>{info?.name}</Media.Title>
          {info && (info.artists.length > 0 || year) ? (
            <Media.Sub className="whitespace-normal">
              <Meta>
                {info.artists.length > 0 ? (
                  <span>
                    {info.artists.map((artist, index) => (
                      <span key={artist.id}>
                        {index > 0 ? ", " : null}
                        <Link
                          to="/app/$packageId/artists/$artistId"
                          params={{ packageId, artistId: String(artist.id) }}
                          className="text-foreground underline-offset-2 hover:underline"
                        >
                          {artist.name}
                        </Link>
                      </span>
                    ))}
                  </span>
                ) : null}
                {year ? <span>{year}</span> : null}
                {info.trackCount ? <span>{info.trackCount} tracks</span> : null}
              </Meta>
            </Media.Sub>
          ) : null}
        </Media.Body>
        <Media.End>
          {/* The Explorer opens on the item's tracks, with the rule as a chip to edit or remove. */}
          <Link
            to="/app/$packageId/explorer"
            params={{ packageId }}
            search={{
              base: "tracks",
              rules: [{ ...rule, label: info?.name }],
            }}
            className={buttonVariants({ variant: "outline" })}
          >
            Explore all
            <Icon icon={ArrowRight01Icon} />
          </Link>
        </Media.End>
      </Media>
      <Grid cols={4}>
        {(["playtime", "streams", "tracks", "skipRate"] as const).map((key) => (
          <Card key={key} size="xs">
            <Stat>
              <Stat.Label>{measures[key].label}</Stat.Label>
              {key === "tracks" && tracks ? (
                <Stat.Value>{tracks}</Stat.Value>
              ) : (
                <Stat.Value value={stats?.[key]} kind={measures[key].kind} />
              )}
            </Stat>
          </Card>
        ))}
      </Grid>
      <Monthly rule={rule} />
      {children}
    </Page>
  );
};
