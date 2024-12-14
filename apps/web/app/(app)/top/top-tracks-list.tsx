import { auth } from "@repo/auth";
import { Track } from "@repo/spotify/types";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/alert";
import { cn } from "@repo/ui/lib/utils";
import { Separator } from "@repo/ui/separator";
import { CircleX, Info } from "lucide-react";

import {
  ItemCard,
  ItemCardAlbum,
  ItemCardContent,
  ItemCardDuration,
  ItemCardImage,
  ItemCardLink,
  ItemCardRank,
  ItemCardSubtitle,
  ItemCardTitle,
} from "~/components/item-card";

import { getTopTracks } from "./get-top-user-data";

export const TopTracksList = async () => {
  const session = await auth();
  const tracks = await getTopTracks(session?.user?.id);
  const layout = "list";

  if (!tracks) return <ErrorAlert />;
  if (tracks.length === 0) return <NoTracksAlert />;

  return (
    <div
      className={cn(
        layout === "list"
          ? "flex flex-col"
          : "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
      )}
    >
      {layout === "list" ? (
        <ListLayout tracks={tracks} />
      ) : (
        <GridLayout tracks={tracks} />
      )}
    </div>
  );
};

const ErrorAlert = () => (
  <Alert variant="destructive">
    <CircleX className="size-4" />
    <AlertTitle>Failed to load tracks</AlertTitle>
    <AlertDescription>Try refreshing the page</AlertDescription>
  </Alert>
);

const NoTracksAlert = () => (
  <Alert variant="info">
    <Info className="size-4" />
    <AlertTitle>No tracks found</AlertTitle>
    <AlertDescription>
      Try listening to more music to see some tracks here
    </AlertDescription>
  </Alert>
);

const ListLayout = ({ tracks }: { tracks: Track[] }) => (
  <>
    {tracks
      .filter((track) => track.duration_ms > 0)
      .map((track, index) => (
        <div key={track.id}>
          <ItemCard>
            <ItemCardRank>{index + 1}</ItemCardRank>
            <ItemCardImage src={track.album.images[0].url} alt={track.name} />
            <ItemCardContent>
              <ItemCardTitle>{track.name}</ItemCardTitle>
              <ItemCardSubtitle>
                {track.artists.map((artist) => artist.name).join(", ")}
              </ItemCardSubtitle>
            </ItemCardContent>
            <ItemCardLink href={track.external_urls.spotify} />
            <ItemCardAlbum>{track.album.name}</ItemCardAlbum>
            <ItemCardDuration duration={track.duration_ms} />
          </ItemCard>
          {index < tracks.length - 1 && <Separator />}
        </div>
      ))}
  </>
);

const GridLayout = ({ tracks }: { tracks: Track[] }) => (
  <>
    {tracks
      .filter((track) => track.duration_ms > 0)
      .map((track, index) => (
        // <TopListItemCard
        //   key={track.id}
        //   layout="grid"
        //   imageUri={track.album.images[0]?.url}
        //   title={`${index + 1}. ${track.name}`}
        //   subtitle={track.artists.map((artist) => artist.name).join(", ")}
        //   link={track.external_urls.spotify}
        //   album={track.album.name}
        //   showSubtitle
        //   duration={track.duration_ms}
        // />
        <ItemCard key={track.id} layout="grid">
          <ItemCardImage
            layout="grid"
            src={track.album.images[0].url}
            alt={track.name}
          />
          <ItemCardTitle layout="grid">{`${index + 1}. ${track.name}`}</ItemCardTitle>
        </ItemCard>
      ))}
  </>
);
