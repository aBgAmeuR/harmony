import { Suspense } from "react";
import { auth } from "@repo/auth";
import { spotify } from "@repo/spotify";
import { NumberFlow } from "@repo/ui/number";
import { notFound } from "next/navigation";

import { AppHeader } from "~/components/app-header";

import {
  TracksAlbumLists,
  TracksAlbumsListsSkeleton,
} from "./tracks-album-lists";

type Props = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    back: string;
  }> | null;
};

export default async function DetailArtistPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { back = "/overview" } = searchParams ? await searchParams : {};

  const artist = await spotify.artists.get(id);
  if (!artist) return notFound();

  const session = await auth();

  return (
    <>
      <AppHeader items={["Detail", "Artist", artist.name]}></AppHeader>
      {/* <header className="p-4 flex items-center">
        <Link
          href={back}
          className={cn(buttonVariants({ variant: "secondary", size: "icon" }))}
        >
          <ArrowLeft className="size-4" />
        </Link>
      </header> */}
      <div className="flex flex-row items-end gap-4 mb-6 p-4 max-w-7xl w-full mx-auto">
        <img
          src={artist.images[0].url || "/placeholder.svg"}
          alt={artist.name}
          className="rounded-full shadow-lg size-24 md:size-32"
        />
        <div className="text-left">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{artist.name}</h1>
          <NumberFlow
            value={artist.followers.total}
            suffix=" followers"
            format={{ notation: "standard" }}
            className="text-muted-foreground mb-2 md:mb-4"
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-8 p-4 pt-0 max-w-7xl w-full mx-auto">
        <Suspense fallback={<TracksAlbumsListsSkeleton />}>
          <TracksAlbumLists sessionId={session?.user.id} artistId={id} />
          {/* <TracksAlbumsListsSkeleton /> */}
        </Suspense>
      </div>
    </>
  );
}
