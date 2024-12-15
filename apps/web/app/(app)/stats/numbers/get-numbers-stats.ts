"use server";

import { spotify } from "@repo/spotify";
import { Track as SpotifyTrack } from "@repo/spotify/types";
import { format } from "light-date";

import { getMonthRangeAction } from "~/actions/month-range-actions";

import { getTracks } from "./utils";

type DayStats = {
  totalPlayed: number;
  totalTime: bigint;
};

type Track = Awaited<ReturnType<typeof getTracks>>[number];

type Stats = {
  listeningTime: bigint;
  totalPlays: number;
  uniqueTracks: number;
  differentArtists: number;
  dayStats: Record<string, DayStats>;
  mostActiveDay: {
    day: string;
    totalTime: number;
    totalPlayed: number;
  };
  onlineTrackPercent: number;
  mostFwdbtnTrack: {
    spotifyId: string;
    totalPlayed: number;
  };
};

export const getNumbersStats = async (userId: string | undefined) => {
  if (!userId) return null;

  const monthRange = await getMonthRangeAction();
  if (!monthRange) return null;

  const tracks = await getTracks(
    userId,
    monthRange.dateStart,
    monthRange.dateEnd,
  );
  if (tracks.length === 0) return getEmptyStats();

  const stats = calculateStats(tracks);
  const trackDetails = await fetchTrackDetails(
    tracks,
    stats.mostFwdbtnTrack.spotifyId,
  );

  return formatResponse(stats, tracks, trackDetails);
};

const getEmptyStats = () => ({
  listeningTime: 0,
  totalPlays: 0,
  uniqueTracks: 0,
  differentArtists: 0,
  firstTrack: {
    timestamp: null,
    id: null,
    name: null,
    cover: null,
    artists: null,
  },
  mostActiveDay: {
    day: null,
    totalTime: 0,
    totalPlayed: 0,
  },
  onlineTrackPercent: 0,
  mostFwdbtnTrack: {
    totalPlayed: 0,
    id: null,
    name: null,
    cover: null,
    artists: null,
  },
});

const calculateStats = (tracks: Track[]): Stats => {
  const listeningTime = tracks.reduce(
    (sum, track) => sum + track.msPlayed,
    BigInt(0),
  );
  const totalPlays = tracks.length;
  const uniqueTracks = new Set(tracks.map((track) => track.spotifyId)).size;
  const differentArtists = new Set(tracks.flatMap((track) => track.artistIds))
    .size;

  const dayStats = aggregateDayStats(tracks);
  const mostActiveDay = findMostActiveDay(dayStats);

  const onlineTracks = tracks.filter((track) => !track.offline).length;
  const onlineTrackPercent = Math.round((onlineTracks / totalPlays) * 100);

  const fwdbtnTracks = tracks.filter((track) => track.reasonStart === "fwdbtn");
  const mostFwdbtnTrack = findMostFwdbtnTrack(fwdbtnTracks);

  return {
    listeningTime,
    totalPlays,
    uniqueTracks,
    differentArtists,
    dayStats,
    mostActiveDay,
    onlineTrackPercent,
    mostFwdbtnTrack,
  };
};

const aggregateDayStats = (tracks: Track[]): Record<string, DayStats> => {
  return tracks.reduce<Record<string, DayStats>>((stats, track) => {
    const day = format(track.timestamp, "{MM}/{dd}/{yyyy}");
    if (!stats[day]) stats[day] = { totalPlayed: 0, totalTime: BigInt(0) };
    stats[day].totalPlayed += 1;
    stats[day].totalTime += track.msPlayed;
    return stats;
  }, {});
};

const findMostActiveDay = (dayStats: Record<string, DayStats>) => {
  return Object.entries(dayStats).reduce(
    (max, [day, stats]) =>
      stats.totalTime > max.totalTime
        ? {
            day,
            totalTime: Number(stats.totalTime),
            totalPlayed: stats.totalPlayed,
          }
        : max,
    { day: "", totalTime: 0, totalPlayed: 0 },
  );
};

const findMostFwdbtnTrack = (fwdbtnTracks: Track[]) => {
  const fwdbtnTrackCount = fwdbtnTracks.reduce<Record<string, number>>(
    (count, track) => {
      count[track.spotifyId] = (count[track.spotifyId] || 0) + 1;
      return count;
    },
    {},
  );

  return Object.entries(fwdbtnTrackCount).reduce(
    (max, [spotifyId, totalPlayed]) =>
      totalPlayed > max.totalPlayed ? { spotifyId, totalPlayed } : max,
    { spotifyId: "", totalPlayed: 0 },
  );
};

const fetchTrackDetails = async (
  tracks: Track[],
  mostFwdbtnTrackId: string,
): Promise<SpotifyTrack[]> => {
  const trackIds = [tracks[0].spotifyId, mostFwdbtnTrackId];
  return await spotify.tracks.list(trackIds);
};

const formatResponse = (
  stats: Stats,
  tracks: Track[],
  trackDetails: SpotifyTrack[],
) => {
  const firstTrackDetails = trackDetails.find(
    (track) => track.id === tracks[0].spotifyId,
  );
  const mostFwdbtnTrackDetails = trackDetails.find(
    (track) => track.id === stats.mostFwdbtnTrack.spotifyId,
  );

  return {
    listeningTime: Number(stats.listeningTime),
    totalPlays: stats.totalPlays,
    uniqueTracks: stats.uniqueTracks,
    differentArtists: stats.differentArtists,
    firstTrack: {
      timestamp: tracks[0]?.timestamp,
      id: firstTrackDetails?.id,
      name: firstTrackDetails?.name,
      cover: firstTrackDetails?.album.images[0].url,
      artists: firstTrackDetails?.artists.map((artist) => artist.name),
    },
    mostActiveDay: stats.mostActiveDay,
    onlineTrackPercent: stats.onlineTrackPercent,
    mostFwdbtnTrack: {
      totalPlayed: stats.mostFwdbtnTrack.totalPlayed,
      id: mostFwdbtnTrackDetails?.id,
      name: mostFwdbtnTrackDetails?.name,
      cover: mostFwdbtnTrackDetails?.album.images[0].url,
      artists: mostFwdbtnTrackDetails?.artists.map((artist) => artist.name),
    },
  };
};
