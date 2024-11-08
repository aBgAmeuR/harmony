"use client";

import { useQuery } from "@tanstack/react-query";

import { TopListItemCard } from "./top-list-item-card";
import { TopListSkeleton } from "./top-list-skeleton";

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

  if (isError) return <div>Failed to load artists</div>;
  if (!artists) return <TopListSkeleton length={50} layout={layout} />;

  return (
    <div
      className={cn(
        "gap-4",
        layout === "list"
          ? "flex flex-col"
          : "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      )}
    >
      {artists?.map((artist, index) => (
        <TopListItemCard
          key={artist.id}
          layout={layout}
          imageUri={artist.images[0].url}
          title={artist.name}
          subtitle={artist.genres.join(", ")}
          rank={index + 1}
          link={artist.external_urls.spotify}
        />
      ))}
    </div>
  );
};
