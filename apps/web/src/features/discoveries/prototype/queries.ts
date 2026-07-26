import { db } from "@harmony/duckdb";
import { queryOptions } from "@tanstack/react-query";

import { toSqlDate } from "@/lib/sql/date-range";

export type WeeklyActivityPoint = {
  name: string;
  value: number;
};

export type ArtistRelease = {
  album: string;
  releaseDate: string;
  periodLabel: string;
  image: string | null;
};

async function weeklyActivityFn(args: {
  artistId: number;
  from: Date;
  to: Date;
}): Promise<WeeklyActivityPoint[]> {
  const from = toSqlDate(args.from);
  const to = toSqlDate(args.to);
  return db.query<WeeklyActivityPoint>(`
    WITH period_range AS (
      SELECT date_trunc('week', generate_series::DATE)::DATE AS period
      FROM generate_series(
        date_trunc('week', DATE '${from}')::DATE,
        date_trunc('week', DATE '${to}')::DATE,
        INTERVAL 1 WEEK
      )
    ),
    stats AS (
      SELECT
        date_trunc('week', i.ts)::DATE AS period,
        (SUM(i.ms_played) / 60000)::INTEGER AS value
      FROM interactions i
      JOIN tracks t ON t.id = i.track_id
      WHERE CAST(i.ts AS DATE) >= DATE '${from}'
        AND CAST(i.ts AS DATE) <= DATE '${to}'
        AND t.artists @> ARRAY[${args.artistId}]
      GROUP BY date_trunc('week', i.ts)::DATE
    )
    SELECT
      strftime(p.period, '%d %b %Y') AS name,
      COALESCE(s.value, 0)::INTEGER AS value
    FROM period_range p
    LEFT JOIN stats s ON s.period = p.period
    ORDER BY p.period
  `);
}

async function artistReleasesFn(args: {
  artistId: number;
  from: Date;
  to: Date;
}): Promise<ArtistRelease[]> {
  const from = toSqlDate(args.from);
  const to = toSqlDate(args.to);
  return db.query<ArtistRelease>(`
    SELECT
      al.title AS album,
      CAST(al.release_date AS VARCHAR) AS "releaseDate",
      strftime(date_trunc('week', al.release_date)::DATE, '%d %b %Y') AS "periodLabel",
      al.image AS image
    FROM albums al
    WHERE al.artists @> ARRAY[${args.artistId}]
      AND al.release_date IS NOT NULL
      AND al.release_date BETWEEN DATE '${from}' AND DATE '${to}'
    ORDER BY al.release_date
  `);
}

export const discoveriesPrototypeQueries = {
  weeklyActivity: {
    queryOptions: (args: { artistId: number; from: Date; to: Date }) =>
      queryOptions({
        queryKey: [
          "discoveries-proto",
          "weekly-activity",
          { artistId: args.artistId, from: toSqlDate(args.from), to: toSqlDate(args.to) },
        ],
        queryFn: () => weeklyActivityFn(args),
        enabled: Number.isFinite(args.artistId),
      }),
  },
  artistReleases: {
    queryOptions: (args: { artistId: number; from: Date; to: Date }) =>
      queryOptions({
        queryKey: [
          "discoveries-proto",
          "artist-releases",
          { artistId: args.artistId, from: toSqlDate(args.from), to: toSqlDate(args.to) },
        ],
        queryFn: () => artistReleasesFn(args),
        enabled: Number.isFinite(args.artistId),
      }),
  },
};
