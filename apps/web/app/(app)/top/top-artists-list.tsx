import { auth } from "@repo/auth";
import { Artist } from "@repo/spotify/types";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/alert";
import { cn } from "@repo/ui/lib/utils";
import { Separator } from "@repo/ui/separator";
import { CircleX, Info } from "lucide-react";

import {
  ItemCard,
  ItemCardContent,
  ItemCardImage,
  ItemCardLink,
  ItemCardRank,
  ItemCardSubtitle,
  ItemCardTitle,
} from "~/components/item-card";

import { getTopArtists } from "./get-top-user-data";

export const TopArtistList = async () => {
  const session = await auth();
  const artists = await getTopArtists(session?.user?.id);
  const layout = "list";

  if (!artists) return <ErrorAlert />;
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
