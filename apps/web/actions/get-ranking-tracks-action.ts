"use server";

import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { spotify } from "@repo/spotify";

export const getRankingTracksAction = async (minDate: Date, maxDate: Date) => {
  const session = await auth();

  if (!session?.user.id) {
    return null;
  }

  const topTracks = await prisma.track.groupBy({
    by: ["spotifyId"],
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

  const tracksInfos = await spotify.tracks.list(
    topTracks.map((track) => track.spotifyId),
  );

  return tracksInfos.map((track) => {
    const topTrack = topTracks.find(
      (topTrack) => topTrack.spotifyId === track.id,
    );
    return {
      name: track.name,
      href: track.external_urls.spotify,
      duration: track.duration_ms,
      artists: track.artists.map((artist) => artist.name).join(", "),
      album: track.album.name,
      releaseDate: track.album.release_date,
      cover: track.album.images[0].url,
      totalPlayed: topTrack?._count?._all || 0,
      msPlayed: topTrack?._sum?.msPlayed ? Number(topTrack._sum.msPlayed) : 0,
    };
  });
};
