"use server";

import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { spotify } from "@repo/spotify";

export const getRankingAlbumsAction = async (minDate: Date, maxDate: Date) => {
  const session = await auth();

  if (!session?.user.id) {
    return null;
  }

  const topAlbums = await prisma.track.groupBy({
    by: ["albumId"],
    _count: {
      _all: true,
    },
    _sum: {
      msPlayed: true,
    },
    where: {
      userId: session.user.id,
      timestamp: {
        gte: minDate,
        lt: maxDate,
      },
    },
    orderBy: {
      _sum: {
        msPlayed: "desc",
      },
    },
    take: 50,
  });

  const albumIds = topAlbums.map((album) => album.albumId);
  const albumsInfos = await spotify.albums.list(albumIds);

  return albumsInfos.map((album) => {
    const topAlbum = topAlbums.find(
      (topAlbum) => topAlbum.albumId === album.id,
    );
    return {
      name: album.name || "Unknown",
      href: album.external_urls.spotify,
      releaseDate: album.release_date,
      cover: album.images[0].url,
      totalPlayed: topAlbum?._count?._all || 0,
      msPlayed: topAlbum?._sum?.msPlayed ? Number(topAlbum._sum.msPlayed) : 0,
      artists: album.artists.map((artist) => artist.name).join(", "),
    };
  });
};
