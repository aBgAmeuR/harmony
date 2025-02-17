import { notFound } from "next/navigation";

import { ListSkeleton } from "~/components/list-skeleton";
import { getArtistDetails } from "~/services/details/get-artist-details";

import { AlbumList } from "./album-list";
import { TrackList } from "./track-list";

type TracksAlbumListsProps = {
  sessionId?: string;
  artistId: string;
};

export const TracksAlbumLists = async ({
  sessionId,
  artistId,
}: TracksAlbumListsProps) => {
  const artistData = await getArtistDetails(sessionId, artistId);
  if (!artistData) return notFound();

  return (
    <>
      <TrackList tracks={artistData.tracks} />
      <AlbumList albums={artistData.albums} />
    </>
  );
};

export const TracksAlbumsListsSkeleton = () => (
  <>
    <ListSkeleton length={10} layout="grid" />
    <ListSkeleton length={10} showRank />
  </>
);
