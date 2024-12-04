import { ChevronRight, ExternalLink } from "lucide-react";
import Image from "next/image";

import { getMsPlayedInMinutes } from "~/lib/utils";

type RankCardProps = {
  type: "track" | "artist" | "album";
  item: {
    href: string;
    cover?: string;
    image?: string;
    name: string;
    artists?: string;
    msPlayed: number;
    totalPlayed: number;
  };
  rank: number;
};

export const RankingCard = ({ type, item, rank }: RankCardProps) => {
  const imageSrc = type === "artist" ? item.image : item.cover;
  const imageAlt = item.name;

  return (
    <article className="flex items-center space-x-2 py-4 sm:space-x-4">
      <span className="w-6 text-right text-sm font-medium text-muted-foreground">
        {rank}
      </span>
      <Image
        src={imageSrc!}
        alt={imageAlt}
        width={64}
        height={64}
        className="aspect-square rounded-md object-cover"
      />
      <div className="flex-1">
        <div className="inline-flex flex-col gap-1">
          <a
            className="group flex gap-1 cursor-pointer w-auto items-center"
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <p className="line-clamp-2 break-all text-sm font-medium group-hover:underline ">
              {item.name}
            </p>
            <ExternalLink className="size-3 hidden group-hover:block" />
            <span className="sr-only">Open in Spotify</span>
          </a>
          {type !== "artist" && (
            <p className="line-clamp-2 break-all text-sm text-muted-foreground">
              {item.artists}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-1 flex flex-col items-start">
        <p className="text-sm text-muted-foreground">{`${getMsPlayedInMinutes(item.msPlayed)} minutes`}</p>
        <p className="text-sm text-muted-foreground">{`${item.totalPlayed} streams`}</p>
      </div>
      <button className="flex items-center hover:translate-x-0.5 duration-100 cursor-pointer">
        <ChevronRight />
      </button>
    </article>
  );
};
