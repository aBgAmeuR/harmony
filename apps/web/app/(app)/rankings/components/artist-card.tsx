import { ChevronRight, ExternalLink } from "lucide-react";
import Image from "next/image";

import { getRankingArtistsAction } from "~/actions/get-ranking-artists-action";

const getMsPlayedInMinutes = (msPlayed: number) =>
  (msPlayed / (1000 * 60)).toFixed(2);

type ArtistCardProps = {
  artist: NonNullable<Awaited<ReturnType<typeof getRankingArtistsAction>>>[0];
  rank: number;
};

export const ArtistCard = ({ artist, rank }: ArtistCardProps) => {
  return (
    <article className="flex items-center space-x-2 py-4 sm:space-x-4">
      <span className="w-6 text-right text-sm font-medium text-muted-foreground">
        {rank}
      </span>
      <Image
        src={artist.image}
        alt={artist.name}
        width={64}
        height={64}
        className="aspect-square rounded-md object-cover"
      />
      <div className="flex-1 space-y-1">
        <a
          className="group flex gap-1 cursor-pointer w-auto"
          href={artist.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          <p className="line-clamp-2 break-all text-sm font-medium leading-none group-hover:underline">
            {artist.name}
          </p>
          <ExternalLink className="size-3 hidden group-hover:block" />
          <span className="sr-only">Open in Spotify</span>
        </a>
      </div>
      <div className="space-y-1 flex flex-col items-start">
        <p className="text-sm text-muted-foreground">{`${getMsPlayedInMinutes(artist.msPlayed)} minutes`}</p>
        <p className="text-sm text-muted-foreground">{`${artist.totalPlayed} streams`}</p>
      </div>
      <button className="flex items-center hover:translate-x-0.5 duration-100 cursor-pointer">
        <ChevronRight />
      </button>
    </article>
  );
};
