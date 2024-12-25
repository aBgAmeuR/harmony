"server-only";

import { prisma } from "@repo/database";
import { spotify } from "@repo/spotify";

import { getMsPlayedInMinutes } from "~/lib/utils";

const getTimeRangeStats = async (userId: string) => {
  return await prisma.user.findFirst({
    where: { id: userId },
    select: { timeRangeStats: true },
  });
};

const formatFollowers = (followers: number) => {
  if (followers >= 1_000_000) return `${(followers / 1_000_000).toFixed(1)}M`;
  if (followers >= 1_000) return `${(followers / 1_000).toFixed(1)}k`;
  return followers.toString();
};

export const getTopArtists = async (userId: string | undefined) => {
  if (!userId) return null;

  const timeRangeStats = await getTimeRangeStats(userId);
  if (!timeRangeStats) return null;

  const artists = await spotify.me.top(
    "artists",
    timeRangeStats.timeRangeStats,
  );

  return artists.map((artist) => ({
    id: artist.id,
    image: artist.images[0].url,
    name: artist.name,
    href: artist.external_urls.spotify,
    artists: artist.genres.join(", "),
    stat1: `${artist.popularity}% popularity`,
    stat2: `${formatFollowers(artist.followers.total)} followers`,
  }));
};

export const getTopTracks = async (userId: string | undefined) => {
  if (!userId) return null;

  const timeRangeStats = await getTimeRangeStats(userId);
  if (!timeRangeStats) return null;

  const tracks = await spotify.me.top("tracks", timeRangeStats.timeRangeStats);

  return tracks.map((track) => ({
    id: track.id,
    image: track.album.images[0].url,
    name: track.name,
    href: track.external_urls.spotify,
    artists: track.artists.map((artist) => artist.name).join(", "),
    stat1: `${track.popularity}% popularity`,
    stat2: `${getMsPlayedInMinutes(track.duration_ms)} minutes`,
  }));
};
