import React from "react";

import { TopListItemCard } from "../../top/components/top-list-item-card";

import { Separator } from "@/components/ui/separator";
import { getUserRecentlyPlayed } from "@/lib/spotify";

export const RecentlyPlayedList = async () => {
  const tracks = await getUserRecentlyPlayed();

  return (
    <div className="flex flex-col">
      {tracks?.map((track, index) => (
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
