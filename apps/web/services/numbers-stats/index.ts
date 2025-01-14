"use server";

import { prisma } from "@repo/database";
import { spotify } from "@repo/spotify";
import { Track } from "@repo/spotify/types";

import { getMonthRange } from "~/lib/utils-server";

import {
  queryFirstTrack,
  queryMostActiveDay,
  queryMostFwdbtnTrack,
  queryNumbersStats,
} from "./queries";

export const getNumbersStats = async (
  userId: string | undefined,
  isDemo: boolean,
) => {
  if (!userId) return null;

  const monthRange = await getMonthRange(userId, isDemo);
  if (!monthRange) return null;

  try {
    const [stats, mostActive, firstTrack, mostFwdbtnTrack] =
      await prisma.$transaction([
        queryNumbersStats(userId, monthRange),
        queryMostActiveDay(userId, monthRange),
        queryFirstTrack(userId, monthRange),
        queryMostFwdbtnTrack(userId, monthRange),
      ]);

    const trackDetails = await fetchTrackDetails(
      firstTrack[0]?.spotifyId,
      mostFwdbtnTrack[0]?.spotifyId,
    );

    return {
      listeningTime: stats[0]?.total_listening_time || 0,
      totalPlays: Number(stats[0]?.total_tracks || 0),
      uniqueTracks: Number(stats[0]?.unique_tracks || 0),
      differentArtists: Number(stats[0]?.different_artists || 0),
      firstTrack: formatFirstTrack(firstTrack[0], trackDetails?.at(0)),
      mostActiveDay: formatMostActiveDay(mostActive[0]),
      onlineTrackPercent: calculateOnlineTrackPercent(stats[0]),
      mostFwdbtnTrack: formatMostFwdbtnTrack(
        mostFwdbtnTrack[0],
        trackDetails?.at(1),
      ),
    };
  } catch (error) {
    console.error("Error fetching Spotify stats:", error);
    return null;
  }
};

const fetchTrackDetails = async (...trackIds: (string | undefined)[]) => {
  try {
    const validIds = trackIds.filter(Boolean) as string[];
    if (validIds.length === 0) return null;
    return spotify.tracks.list(validIds);
  } catch (error) {
    console.error("Error fetching track details:", error);
    return null;
  }
};

const formatFirstTrack = (
  track: {
    timestamp: Date;
    spotifyId: string;
  },
  details: Track | undefined,
) => {
  const artists = details?.artists.map((artist) => artist.name).join(", ");
  return {
    timestamp: track.timestamp,
    id: track.spotifyId,
    name: details?.name || "Unknown",
    cover: details?.album.images[0]?.url || "",
    artists: artists || "Unknown",
    href: details?.href || "",
  };
};

const formatMostFwdbtnTrack = (
  track: {
    spotifyId: string;
    total_played: number;
  },
  details: Track | undefined,
) => {
  const artists = details?.artists.map((artist) => artist.name).join(", ");
  return {
    id: track.spotifyId || "Unknown",
    name: details?.name || "Unknown",
    cover: details?.album.images[0]?.url || "",
    artists: artists || "Unknown",
    href: details?.href || "",
    totalPlayed: track.total_played,
  };
};

const formatMostActiveDay = (
  mostActiveDay: Awaited<ReturnType<typeof queryMostActiveDay>>[0],
) => {
  return {
    day: mostActiveDay.day,
    totalTime: Number(mostActiveDay.total_time || 0),
    totalPlayed: mostActiveDay.total_played || 0,
  };
};

const calculateOnlineTrackPercent = (
  numStats: Awaited<ReturnType<typeof queryNumbersStats>>[0],
) => {
  if (!numStats?.total_tracks) return 0;
  return Math.round(
    (Number(numStats.online_tracks) / Number(numStats.total_tracks)) * 100,
  );
};
