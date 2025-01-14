import { prisma } from "@repo/database";

type MonthRange = {
  dateStart: Date;
  dateEnd: Date;
};

export const queryNumbersStats = (userId: string, monthRange: MonthRange) => {
  return prisma.$queryRaw<
    Array<{
      total_listening_time: number;
      total_tracks: bigint;
      unique_tracks: bigint;
      different_artists: bigint;
      online_tracks: bigint;
    }>
  >`
    SELECT
      COALESCE(SUM("msPlayed"), 0) as total_listening_time,
      COUNT(*) as total_tracks,
      COUNT(DISTINCT "spotifyId") as unique_tracks,
      COUNT(DISTINCT artist_id) as different_artists,
      COUNT(*) FILTER (WHERE offline = false) as online_tracks
    FROM "Track",
    LATERAL UNNEST("artistIds") as artist_id
    WHERE "userId" = ${userId}
    AND timestamp BETWEEN ${monthRange.dateStart} AND ${monthRange.dateEnd}
  `;
};

export const queryMostActiveDay = (userId: string, monthRange: MonthRange) => {
  return prisma.$queryRaw<
    Array<{
      day: string;
      total_time: bigint;
      total_played: number;
    }>
  >`
    SELECT
      TO_CHAR("timestamp", 'MM/DD/YYYY') as day,
      COALESCE(SUM("msPlayed"), 0) as total_time,
      COUNT(*) as total_played
    FROM "Track"
    WHERE "userId" = ${userId}
    AND timestamp BETWEEN ${monthRange.dateStart} AND ${monthRange.dateEnd}
    GROUP BY day
    ORDER BY total_time DESC
    LIMIT 1
  `;
};

export const queryFirstTrack = (userId: string, monthRange: MonthRange) => {
  return prisma.$queryRaw<
    Array<{
      timestamp: Date;
      spotifyId: string;
    }>
  >`
    SELECT
      "timestamp",
      "spotifyId"
    FROM "Track"
    WHERE "userId" = ${userId}
    AND timestamp BETWEEN ${monthRange.dateStart} AND ${monthRange.dateEnd}
    ORDER BY "timestamp" ASC
    LIMIT 1
  `;
};

export const queryMostFwdbtnTrack = (
  userId: string,
  monthRange: MonthRange,
) => {
  return prisma.$queryRaw<
    Array<{
      spotifyId: string;
      total_played: number;
    }>
  >`
    SELECT
      "spotifyId",
      COUNT(*) as total_played
    FROM "Track"
    WHERE "userId" = ${userId}
    AND "reasonStart" = 'fwdbtn'
    AND timestamp BETWEEN ${monthRange.dateStart} AND ${monthRange.dateEnd}
    GROUP BY "spotifyId"
    ORDER BY total_played DESC
    LIMIT 1
  `;
};
