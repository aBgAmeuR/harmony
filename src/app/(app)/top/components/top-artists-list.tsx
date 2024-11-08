"use client";

import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { TopListSkeleton } from "./top-list-skeleton";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getUserTopItems } from "@/lib/spotify";
import { useTopTimeRange } from "@/lib/store";
import { Artist } from "@/types/spotify";

export const TopArtistList = () => {
  const timeRange = useTopTimeRange((state) => state.time_range);
  const layout = useTopTimeRange((state) => state.list_layout);

  const { data: artists, isError } = useQuery({
    queryKey: ["top_tracks", "artists", timeRange],
    queryFn: async () => {
      return await getUserTopItems<Artist>("artists", timeRange);
    }
  });

  if (isError) return <div>Failed to load artists</div>;
  if (!artists) return <TopListSkeleton length={50} />;

  if (layout === "grid") {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {artists?.map((artist, index) => (
          <div key={artist.id} className="group relative">
            <Image
              src={artist.images[0].url}
              alt={`${artist.name} cover`}
              width={200}
              height={200}
              className="aspect-square rounded-md"
            />
            <div className="absolute right-0 top-0">
              <Button
                className="opacity-0 group-hover:opacity-100"
                variant="link"
                aria-label="Open in Spotify"
              >
                <Link
                  href={artist.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  passHref
                >
                  <ExternalLink className="size-8" />
                </Link>
              </Button>
            </div>
            <p className="mt-1 line-clamp-1 break-all text-sm font-medium">{`${index + 1}. ${artist.name}`}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {artists?.map((artist, index) => (
        <div key={artist.id}>
          <div className="flex items-center space-x-4 py-4">
            <span className="w-6 text-right text-sm font-medium text-muted-foreground">
              {index + 1}
            </span>
            <Image
              src={artist.images[0].url}
              alt={`${artist.name} cover`}
              width={64}
              height={64}
              className="aspect-square rounded-md"
            />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">{artist.name}</p>
              <p className="text-sm text-muted-foreground">
                {artist.genres.join(", ")}
              </p>
            </div>
            <a
              href={artist.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80"
            >
              <ExternalLink className="size-4" />
              <span className="sr-only">Open in Spotify</span>
            </a>
          </div>
          {index < artists.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  );
};
