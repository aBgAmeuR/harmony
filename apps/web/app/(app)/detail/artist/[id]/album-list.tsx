import { Alert, AlertDescription, AlertTitle } from "@repo/ui/alert";
import { Separator } from "@repo/ui/separator";
import { Info } from "lucide-react";

import { MusicItemCard } from "~/components/cards/music-item-card";

type Album = {
  id: string;
  href: string;
  image: string;
  name: string;
  artists: string;
  stat1: string;
  stat2: string;
};

type AlbumListProps = {
  albums: Album[];
};

export const AlbumList = ({ albums }: AlbumListProps) => (
  <div>
    <h2 className="text-xl font-bold">Top Albums</h2>
    <p className="text-sm text-muted-foreground mb-4">
      Here are your top albums
    </p>
    <div className="flex flex-col">
      {albums.map((item, index) => (
        <div key={`${item.id}-${index}}`} className="flex flex-col">
          <MusicItemCard
            item={item}
            rank={index + 1}
            actionHref={`/detail/artist/${item.id}?back=/rankings/artists`}
          />
          {index < albums.length - 1 && <Separator />}
        </div>
      ))}
      {albums.length === 0 && (
        <Alert variant="info">
          <Info className="size-4" />
          <AlertTitle>No album found</AlertTitle>
          <AlertDescription>
            You haven't listened to any music during this period
          </AlertDescription>
        </Alert>
      )}
    </div>
  </div>
);
