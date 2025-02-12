import { FC } from "react";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/alert";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@repo/ui/carousel";
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
  <Carousel
    opts={{
      align: "start",
      skipSnaps: true,
      slidesToScroll: 3,
    }}
  >
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-bold">Your Top Tracks</h2>
      <div className="flex items-center gap-2">
        <CarouselPrevious className="relative left-0 top-0 translate-y-0" />
        <CarouselNext className="relative right-0 top-0 translate-y-0" />
      </div>
    </div>
    <CarouselContent>
      {tracks.map((item, index) => (
        <CarouselItem
          key={`${item.id}-${index}}`}
          className="basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/7 xl:basis-1/8"
        >
          <MusicItemCard
            item={item}
            rank={index + 1}
            actionHref={`/detail/artist/${item.id}?back=/rankings/artists`}
            layout="grid"
          />
        </CarouselItem>
      ))}
    </CarouselContent>
  </Carousel>
);
