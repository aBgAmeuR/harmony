"use client";

import { useQuery } from "@tanstack/react-query";
import { CircleX, Info } from "lucide-react";

import { TopListItemCard } from "./top-list-item-card";
import { TopListSkeleton } from "./top-list-skeleton";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { getUserTopItems } from "@/lib/spotify";
import { useTopTimeRange } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Artist } from "@/types/spotify";

export const TopArtistList = () => {
  const timeRange = useTopTimeRange((state) => state.time_range);
  const layout = useTopTimeRange((state) => state.list_layout);

  const { data: artists, isError } = useQuery({
    queryKey: ["top_tracks", "artists", timeRange],
    queryFn: async () => await getUserTopItems<Artist>("artists", timeRange)
  });

  if (isError)
    return (
      <Alert variant="destructive">
        <CircleX className="size-4" />
        <AlertTitle>Failed to load artists</AlertTitle>
        <AlertDescription>Try refreshing the page</AlertDescription>
      </Alert>
    );

  if (!artists) return <TopListSkeleton layout={layout} />;

  if (artists.length === 0) {
    return (
      <Alert variant="info">
        <Info className="size-4" />
        <AlertTitle>No artists found</AlertTitle>
        <AlertDescription>
          Try listening to more music to see some artists here
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div
      className={cn(
        layout === "list"
          ? "flex flex-col"
          : "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      )}
    >
      {artists?.map((artist, index) => (
        <div key={artist.id}>
          <TopListItemCard
            layout={layout}
            imageUri={artist.images[0].url}
            title={artist.name}
            subtitle={artist.genres.join(", ")}
            rank={index + 1}
            link={artist.external_urls.spotify}
          />
          {layout === "list" && index < artists.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  );
};
