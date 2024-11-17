import { spotify } from "@repo/spotify";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/alert";
import { Separator } from "@repo/ui/separator";
import { CircleX, Info } from "lucide-react";

import {
  ItemCard,
  ItemCardAlbum,
  ItemCardContent,
  ItemCardDuration,
  ItemCardImage,
  ItemCardLink,
  ItemCardSubtitle,
  ItemCardTimestamp,
  ItemCardTitle,
} from "~/components/item-card";

export const RecentlyPlayedList = async () => {
  const tracks = await spotify.me.recentlyPlayed();

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
            <ItemCard>
              <ItemCardImage
                src={track.track.album.images[0].url}
                alt={track.track.name}
              />
              <ItemCardContent>
                <ItemCardTitle>{track.track.name}</ItemCardTitle>
                <ItemCardSubtitle>
                  {track.track.artists.map((artist) => artist.name).join(", ")}
                </ItemCardSubtitle>
              </ItemCardContent>
              <ItemCardLink href={track.track.external_urls.spotify} />
              <ItemCardAlbum>{track.track.album.name}</ItemCardAlbum>
              <ItemCardDuration duration={track.track.duration_ms} />
              <ItemCardTimestamp date={new Date(track.played_at)} />
            </ItemCard>
            {index < tracks.length - 1 && <Separator />}
          </div>
        ))}
    </div>
  );
};
