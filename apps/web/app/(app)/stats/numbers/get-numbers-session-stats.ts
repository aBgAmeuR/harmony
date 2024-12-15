"use server";

import { getMonthRangeAction } from "~/actions/month-range-actions";

import { getTracks } from "./utils";

export const getNumbersSessionStats = async (userId: string | undefined) => {
  if (!userId) return null;
  const monthRange = await getMonthRangeAction();
  if (!monthRange) return null;

  const tracks = await getTracks(
    userId,
    monthRange.dateStart,
    monthRange.dateEnd,
  );

  const sessionDurations: number[] = [];
  let currentSessionStart: Date | null = null;
  let currentSessionDuration = 0;

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    const trackTime = track.timestamp;

    if (!currentSessionStart) {
      currentSessionStart = track.timestamp;
      currentSessionDuration = Number(track.msPlayed) || 0;
    } else {
      const lastTimestamp = currentSessionStart;
      const diff =
        Math.abs(trackTime.getTime() - lastTimestamp.getTime()) / 60000;

      if (diff > 30) {
        sessionDurations.push(currentSessionDuration);
        currentSessionStart = track.timestamp;
        currentSessionDuration = Number(track.msPlayed) || 0;
      } else {
        currentSessionDuration += Number(track.msPlayed) || 0;
        currentSessionStart = track.timestamp;
      }
    }

    if (i === tracks.length - 1) {
      sessionDurations.push(currentSessionDuration);
    }
  }

  const totalSessions = sessionDurations.length;
  const totalDuration = sessionDurations.reduce(
    (sum, duration) => sum + duration,
    0,
  );
  const longestSession = sessionDurations.length
    ? Math.max(...sessionDurations)
    : 0;
  const averageSessionTime = totalSessions ? totalDuration / totalSessions : 0;

  return {
    averageSessionTime: Math.round(averageSessionTime),
    longestSession,
    totalSessions,
  };
};
