import React from "react";
import { CircleX, Info } from "lucide-react";

import { TopListItemCard } from "../../top/components/top-list-item-card";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { getUserRecentlyPlayed } from "@/lib/spotify";

export const RecentlyPlayedList = async () => {
  const tracks = await getUserRecentlyPlayed();

  if (!tracks)
    return (
      <Alert variant="destructive">
        <CircleX className="size-4" />
        <AlertTitle>Failed to load tracks</AlertTitle>
        <AlertDescription>Try refreshing the page</AlertDescription>
      </Alert>
    );

  if (tracks.length === 0) {
    return (
      <Alert variant="info">
        <Info className="size-4" />
        <AlertTitle>No tracks found</AlertTitle>
        <AlertDescription>
          Try listening to more music to see some tracks here
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col">
      {tracks
        ?.filter((track) => track.track.duration_ms > 0)
        .map((track, index) => (
          <div key={`${track.track.id}-recent-${track.played_at}`}>
            <TopListItemCard
              layout="list"
              imageUri={track.track.album.images[0].url}
              title={track.track.name}
              subtitle={track.track.artists
                .map((artist) => artist.name)
                .join(", ")}
              playedAt={track.played_at}
              link={track.track.external_urls.spotify}
              album={track.track.album.name}
              showSubtitle
            />
            {index < tracks.length - 1 && <Separator />}
          </div>
        ))}
    </div>
  );
};
