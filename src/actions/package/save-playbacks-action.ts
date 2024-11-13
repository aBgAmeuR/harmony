"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DataType } from "@/types/data";

export const savePlaybacksAction = async (
  tracks: DataType[],
  packageId: number
) => {
  const session = await auth();

  if (!session || !session.user) return new Error("User not authenticated");

  await prisma.playback.createMany({
    data: tracks
      .map((track) => {
        if (!track.ts || !track.spotify_track_uri || track.ms_played < 3)
          return null;

        return {
          timestamp: new Date(track.ts),
          msPlayed: track.ms_played,
          reasonStart: track.reason_start,
          reasonEnd: track.reason_end,
          shuffle: track.shuffle,
          skipped: track.skipped,
          offline: track.offline,
          offlineTimestamp: track.offline_timestamp,
          incognitoMode: track.incognito_mode,
          trackid: track.spotify_track_uri.split(":")[2],
          packageId: packageId
        };
      })
      .filter((track) => track !== null),
    skipDuplicates: true
  });
};
