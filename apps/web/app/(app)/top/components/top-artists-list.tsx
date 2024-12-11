"use client";

import React from "react";
import { Artist } from "@repo/spotify/types";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/alert";
import { cn } from "@repo/ui/lib/utils";
import { Separator } from "@repo/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { CircleX, Info } from "lucide-react";

import { getTopArtistsAction } from "~/actions/get-top-user-action";
import {
  ItemCard,
  ItemCardContent,
  ItemCardImage,
  ItemCardLink,
  ItemCardRank,
  ItemCardSubtitle,
  ItemCardTitle,
} from "~/components/item-card";
import { ListSkeleton } from "~/components/list-skeleton";
import { useListLayout, useTopTimeRange } from "~/lib/store";

const useTopArtists = (
  timeRange: "long_term" | "medium_term" | "short_term",
  initalData?: Artist[],
) => {
  return useQuery({
    queryKey: ["top_tracks", "artists", timeRange],
    queryFn: async () => await getTopArtistsAction(timeRange),
    initialData: initalData,
  });
};

type TopArtistListProps = {
  initalData?: Artist[];
};

export const TopArtistList = ({ initalData }: TopArtistListProps) => {
  const timeRange = useTopTimeRange((state) => state.time_range);
  const layout = useListLayout((state) => state.list_layout);
  const { data: artists, isError } = useTopArtists(timeRange, initalData);

  if (isError) return <ErrorAlert />;
  if (!artists) return <ListSkeleton layout={layout} />;
  if (artists.length === 0) return <NoArtistsAlert />;

  return (
    <div
      className={cn(
        layout === "list"
          ? "flex flex-col"
          : "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
      )}
    >
      {layout === "list" ? (
        <ListLayout artists={artists} />
      ) : (
        <GridLayout artists={artists} />
      )}
    </div>
  );
};

const ErrorAlert = () => (
  <Alert variant="destructive">
    <CircleX className="size-4" />
    <AlertTitle>Failed to load artists</AlertTitle>
    <AlertDescription>Try refreshing the page</AlertDescription>
  </Alert>
);

const NoArtistsAlert = () => (
  <Alert variant="info">
    <Info className="size-4" />
    <AlertTitle>No artists found</AlertTitle>
    <AlertDescription>
      Try listening to more music to see some artists here
    </AlertDescription>
  </Alert>
);

const ListLayout = ({ artists }: { artists: Artist[] }) => (
  <>
    {artists.map((artist, index) => (
      <div key={artist.id}>
        <ItemCard>
          <ItemCardRank>{index + 1}</ItemCardRank>
          <ItemCardImage src={artist.images[0].url} alt={artist.name} />
          <ItemCardContent>
            <ItemCardTitle>{artist.name}</ItemCardTitle>
            <ItemCardSubtitle>{artist.genres.join(", ")}</ItemCardSubtitle>
          </ItemCardContent>
          <ItemCardLink href={artist.external_urls.spotify} />
        </ItemCard>
        {index < artists.length - 1 && <Separator />}
      </div>
    ))}
  </>
);

const GridLayout = ({ artists }: { artists: Artist[] }) => (
  <>
    {artists.map((artist, index) => (
      <ItemCard key={artist.id} layout="grid">
        <ItemCardImage
          layout="grid"
          src={artist.images[0].url}
          alt={artist.name}
        />
        <ItemCardTitle layout="grid">{`${index + 1}. ${artist.name}`}</ItemCardTitle>
      </ItemCard>
    ))}
  </>
);
