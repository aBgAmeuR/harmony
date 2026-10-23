import { Icon, UserIcon } from "@harmony/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@harmony/ui/components/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@harmony/ui/components/empty";
import { useQuery } from "@tanstack/react-query";

import type { ArtistRelease, WeeklyActivityPoint } from "@/data/discoveries/types";

import { artistQueries } from "@/entities/artist";
import { ArtistsSelect } from "@/features/pick-artist";
import { useScope } from "@/shared/scope";

import { discoveryQueries } from "./api";
import { ListeningVsReleasesChart } from "./releases-chart";

// Stable empty lists, so charts are not rebuilt while the queries load.
const NO_WEEKS: WeeklyActivityPoint[] = [];
const NO_RELEASES: ArtistRelease[] = [];

const SelectArtistOverlay = () => {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/25 backdrop-blur-xs">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon icon={UserIcon} />
          </EmptyMedia>
          <EmptyTitle>Select an artist</EmptyTitle>
          <EmptyDescription>
            Choose an artist to plot weekly listening against their album releases.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <ArtistsSelect
            placeholder="Select an artist"
            className="ms-0! border border-border bg-muted px-2.5 hover:bg-secondary"
          />
        </EmptyContent>
      </Empty>
    </div>
  );
};

export const WeeklyListeningVsReleasesWidget = () => {
  const filter = useScope();
  const hasArtist = filter.artistId != null;

  const { data: artists = [] } = useQuery({
    ...artistQueries.top.queryOptions(filter),
    enabled: !hasArtist,
  });
  const artistId = filter.artistId ?? artists[0]?.id;

  const { data: weekly = NO_WEEKS } = useQuery(
    discoveryQueries.weeklyActivity.queryOptions({ ...filter, artistId }),
  );
  const { data: releases = NO_RELEASES } = useQuery(
    discoveryQueries.artistReleases.queryOptions({ ...filter, artistId }),
  );

  return (
    <Card size="sm" className="pb-0.5">
      <CardHeader>
        <CardTitle>Weekly listening vs releases</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className={!hasArtist ? "pointer-events-none opacity-40 select-none" : undefined}>
          <ListeningVsReleasesChart weekly={weekly} releases={releases} />
        </div>
        {!hasArtist && <SelectArtistOverlay />}
      </CardContent>
    </Card>
  );
};
