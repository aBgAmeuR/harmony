import { FC } from "react";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/alert";
import { Separator } from "@repo/ui/separator";
import { Info } from "lucide-react";

import { MusicItemCard } from "~/components/cards/music-item-card";

type Track = {
  id: string;
  href: string;
  image: string;
  name: string;
  artists: string;
  stat1: string;
  stat2: string;
};

type TrackListProps = {
  tracks: Track[];
};

export const TrackList: FC<TrackListProps> = ({ tracks }) => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Top Tracks</h2>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tracks.map((item, index) => (
        <div key={`${item.id}-${index}}`} className="flex flex-col">
          <MusicItemCard
            item={item}
            rank={index + 1}
            actionHref={`/detail/artist/${item.id}?back=/rankings/artists`}
            layout="grid"
          />
          {index < tracks.length - 1 && <Separator />}
        </div>
      ))}
      {tracks.length === 0 && (
        <Alert variant="info">
          <Info className="size-4" />
          <AlertTitle>No tracks found</AlertTitle>
          <AlertDescription>
            You haven't listened to any music during this period
          </AlertDescription>
        </Alert>
      )}
    </div>
  </div>
);
