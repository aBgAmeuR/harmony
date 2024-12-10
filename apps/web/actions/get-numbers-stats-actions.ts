"use server";

import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { spotify } from "@repo/spotify";
import { format } from "light-date";

export const getNumbersStatsAction = async (minDate: Date, maxDate: Date) => {
  const session = await auth();

  if (!session?.user.id) {
    return null;
  }

  const tracks = await prisma.track.findMany({
    where: {
      userId: session.user.id,
      timestamp: {
        gte: minDate,
        lt: maxDate,
      },
    },
    select: {
      timestamp: true,
      msPlayed: true,
      spotifyId: true,
      artistIds: true,
      offline: true,
      reasonStart: true,
    },
    orderBy: [{ timestamp: "asc" }],
  });

  const listeningTime = tracks.reduce(
    (sum, track) => sum + Number(track.msPlayed),
    0,
  );
  const totalPlays = tracks.length;

  const uniqueTracks = new Set(tracks.map((track) => track.spotifyId)).size;
  const differentArtists = new Set(tracks.flatMap((track) => track.artistIds))
    .size;

  const firstTrack = tracks[0];

  const dayStats: Record<string, { totalPlayed: number; totalTime: number }> =
    {};
  tracks.forEach((track) => {
    const day = format(track.timestamp, "{dd}/{MM}/{yyyy}");
    if (!dayStats[day]) {
      dayStats[day] = { totalPlayed: 0, totalTime: 0 };
    }
    dayStats[day].totalPlayed += 1;
    dayStats[day].totalTime += Number(track.msPlayed);
  });

  let mostPlayedDay = { day: "", totalPlayed: 0 };
  let mostStreamedDay = { day: "", totalTime: 0 };

  Object.entries(dayStats).forEach(([day, stats]) => {
    if (stats.totalPlayed > mostPlayedDay.totalPlayed) {
      mostPlayedDay = { day, totalPlayed: stats.totalPlayed };
    }
    if (stats.totalTime > mostStreamedDay.totalTime) {
      mostStreamedDay = { day, totalTime: stats.totalTime };
    }
  });

  const onlineTracks = tracks.filter((track) => track.offline === false).length;
  const onlineTrackPercent = Math.round((onlineTracks / totalPlays) * 100);

  const fwdbtnTracks = tracks.filter((track) => track.reasonStart === "fwdbtn");
  const fwdbtnTrackCount: Record<string, number> = {};
  fwdbtnTracks.forEach((track) => {
    if (!fwdbtnTrackCount[track.spotifyId]) {
      fwdbtnTrackCount[track.spotifyId] = 0;
    }
    fwdbtnTrackCount[track.spotifyId]++;
  });

  let mostFwdbtnTrack = { spotifyId: "", totalPlayed: 0 };
  Object.entries(fwdbtnTrackCount).forEach(([spotifyId, totalPlayed]) => {
    if (totalPlayed > mostFwdbtnTrack.totalPlayed) {
      mostFwdbtnTrack = { spotifyId, totalPlayed };
    }
  });

  // Get track details
  const trackDetails = await spotify.tracks.list([
    firstTrack.spotifyId,
    mostFwdbtnTrack.spotifyId,
  ]);

  const firstTrackDetails = trackDetails.find(
    (track) => track.id === firstTrack.spotifyId,
  );
  const mostFwdbtnTrackDetails = trackDetails.find(
    (track) => track.id === mostFwdbtnTrack.spotifyId,
  );

  return {
    listeningTime,
    totalPlays,
    uniqueTracks,
    differentArtists,
    firstTrack: {
      timestamp: firstTrack.timestamp,
      id: firstTrackDetails?.id,
      name: firstTrackDetails?.name,
      cover: firstTrackDetails?.album.images[0].url,
      artists: firstTrackDetails?.artists.map((artist) => artist.name),
    },
    mostPlayedDay,
    mostStreamedDay,
    onlineTrackPercent,
    mostFwdbtnTrack: {
      totalPlayed: mostFwdbtnTrack.totalPlayed,
      id: mostFwdbtnTrackDetails?.id,
      name: mostFwdbtnTrackDetails?.name,
      cover: mostFwdbtnTrackDetails?.album.images[0].url,
      artists: mostFwdbtnTrackDetails?.artists.map((artist) => artist.name),
    },
  };
};
