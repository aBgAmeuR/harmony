"use server";

import { getMonthRangeAction } from "~/actions/month-range-actions";

import { getTracks } from "./utils";

export const getNumbersSessionStats = async (userId: string | undefined) => {
  if (!userId) return null;

  const monthRange = await getMonthRangeAction();
  if (!monthRange) return null;

  const { dateStart, dateEnd } = monthRange;
  const tracks = await getTracks(userId, dateStart, dateEnd);

  if (!tracks.length) return null;

  let currentSessionStart: Date | null = null;
  let currentSessionDuration = 0;
  const sessionDurations: number[] = [];

  for (const track of tracks) {
    const trackTime = track.timestamp;

    if (!currentSessionStart) {
      currentSessionStart = trackTime;
      currentSessionDuration = Number(track.msPlayed) || 0;
    } else {
      const lastTimestamp = currentSessionStart;
      const diff =
        Math.abs(trackTime.getTime() - lastTimestamp.getTime()) / 60000;

      if (diff > 30) {
        sessionDurations.push(currentSessionDuration);
        currentSessionStart = trackTime;
        currentSessionDuration = Number(track.msPlayed) || 0;
      } else {
        currentSessionDuration += Number(track.msPlayed) || 0;
      }
    }
  }

  if (currentSessionStart) {
    sessionDurations.push(currentSessionDuration);
  }

  const totalSessions = sessionDurations.length;
  const totalDuration = sessionDurations.reduce(
    (sum, duration) => sum + duration,
    0,
  );
  const longestSession = totalSessions ? Math.max(...sessionDurations) : 0;
  const averageSessionTime = totalSessions ? totalDuration / totalSessions : 0;

  return {
    averageSessionTime: Math.round(averageSessionTime),
    longestSession,
    totalSessions,
  };
};
