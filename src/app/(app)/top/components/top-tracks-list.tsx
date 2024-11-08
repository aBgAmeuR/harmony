"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock, ExternalLink } from "lucide-react";
import Image from "next/image";

import { TopListSkeleton } from "./top-list-skeleton";

import { Separator } from "@/components/ui/separator";
import { getUserTopItems } from "@/lib/spotify";
import { useTopTimeRange } from "@/lib/store";
import { Track } from "@/types/spotify";

export const TopTracksList = () => {
  const timeRange = useTopTimeRange((state) => state.time_range);
  const layout = useTopTimeRange((state) => state.list_layout);

  const { data: tracks, isError } = useQuery({
    queryKey: ["top_tracks", "tracks", timeRange],
    queryFn: async () => {
      return await getUserTopItems<Track>("tracks", timeRange);
    }
  });

  if (isError) return <div>Failed to load tracks</div>;
  if (!tracks) return <TopListSkeleton length={50} />;

  if (layout === "grid") {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {tracks?.map((track, index) => (
          <div key={track.id}>
            <Image
              src={track.album.images[0].url}
              alt={`${track.album.name} cover`}
              width={200}
              height={200}
              className="aspect-square rounded-md"
            />
            <p className="mt-1 line-clamp-1 break-all text-sm font-medium">{`${index + 1}. ${track.name}`}</p>
            <p className="line-clamp-1 break-all text-sm text-muted-foreground">
              {track.artists.map((artist) => artist.name).join(", ")}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {tracks?.map((track, index) => (
        <div key={track.id}>
          <div className="flex items-center space-x-4 py-4">
            <span className="w-6 text-right text-sm font-medium text-muted-foreground">
              {index + 1}
            </span>
            <Image
              src={track.album.images[0].url}
              alt={`${track.album.name} cover`}
              width={64}
              height={64}
              className="aspect-square rounded-md"
            />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">{track.name}</p>
              <p className="text-sm text-muted-foreground">
                {track.artists.map((artist) => artist.name).join(", ")}
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              {track.album.name}
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="size-4" />
              <span>
                {Math.floor(track.duration_ms / 60000)}:
                {((track.duration_ms % 60000) / 1000)
                  .toFixed(0)
                  .padStart(2, "0")}
              </span>
            </div>
            <a
              href={track.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80"
            >
              <ExternalLink className="size-4" />
              <span className="sr-only">Open in Spotify</span>
            </a>
          </div>
          {index < tracks.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  );
};
