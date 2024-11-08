"use client";

import { useQuery } from "@tanstack/react-query";

import { TopListItemCard } from "./top-list-item-card";
import { TopListSkeleton } from "./top-list-skeleton";

import { Separator } from "@/components/ui/separator";
import { getUserTopItems } from "@/lib/spotify";
import { useTopTimeRange } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Track } from "@/types/spotify";

export const TopTracksList = () => {
  const timeRange = useTopTimeRange((state) => state.time_range);
  const layout = useTopTimeRange((state) => state.list_layout);

  const { data: tracks, isError } = useQuery({
    queryKey: ["top_tracks", "tracks", timeRange],
    queryFn: async () => await getUserTopItems<Track>("tracks", timeRange)
  });

  if (isError) return <div>Failed to load tracks</div>;
  if (!tracks) return <TopListSkeleton layout={layout} />;

  return (
    <div
      className={cn(
        layout === "list"
          ? "flex flex-col"
          : "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      )}
    >
      {tracks?.map((track, index) => (
        <div key={track.id}>
          <TopListItemCard
            layout={layout}
            imageUri={track.album.images[0].url}
            title={track.name}
            subtitle={track.artists.map((artist) => artist.name).join(", ")}
            rank={index + 1}
            link={track.external_urls.spotify}
            album={track.album.name}
            showSubtitle
            duration={track.duration_ms}
          />
          {layout === "list" && index < tracks.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  );
};
