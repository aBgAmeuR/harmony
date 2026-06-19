import { interactionDateFilter } from '../sql'
import type { DateRangeInput } from '../types'

const TRACK_ARTISTS_CTE = `
  track_artists AS (
    SELECT
      t.id AS track_id,
      u.artist_id
    FROM tracks t,
    unnest(t.artists) AS u(artist_id)
  )
`

function baseInteractionFilter({ from, to }: DateRangeInput): string {
  return `
    WHERE i.skipped = false
      AND i.ts IS NOT NULL
    ${interactionDateFilter(from, to)}
  `
}

export function buildTotalPlaytimeValueSql(input: DateRangeInput): string {
  return `
    SELECT CAST(ROUND(SUM(i.ms_played) / 60000.0) AS INTEGER) AS value
    FROM interactions i
    ${baseInteractionFilter(input)}
  `
}

export function buildTotalPlaytimeTrendSql(input: DateRangeInput): string {
  return `
    SELECT
      STRFTIME(DATE_TRUNC('month', i.ts), '%b %Y') AS label,
      CAST(ROUND(SUM(i.ms_played) / 60000.0) AS INTEGER) AS value
    FROM interactions i
    ${baseInteractionFilter(input)}
    GROUP BY DATE_TRUNC('month', i.ts)
    ORDER BY DATE_TRUNC('month', i.ts) ASC
  `
}

export function buildStreamsValueSql(input: DateRangeInput): string {
  return `
    SELECT CAST(COUNT(*) AS INTEGER) AS value
    FROM interactions i
    ${baseInteractionFilter(input)}
  `
}

export function buildStreamsTrendSql(input: DateRangeInput): string {
  return `
    SELECT
      STRFTIME(DATE_TRUNC('month', i.ts), '%b %Y') AS label,
      CAST(COUNT(*) AS INTEGER) AS value
    FROM interactions i
    ${baseInteractionFilter(input)}
    GROUP BY DATE_TRUNC('month', i.ts)
    ORDER BY DATE_TRUNC('month', i.ts) ASC
  `
}

export function buildUniqueTracksValueSql(input: DateRangeInput): string {
  return `
    SELECT CAST(COUNT(DISTINCT i.track_id) AS INTEGER) AS value
    FROM interactions i
    ${baseInteractionFilter(input)}
  `
}

export function buildUniqueTracksTrendSql(input: DateRangeInput): string {
  return `
    SELECT
      STRFTIME(DATE_TRUNC('month', i.ts), '%b %Y') AS label,
      CAST(COUNT(DISTINCT i.track_id) AS INTEGER) AS value
    FROM interactions i
    ${baseInteractionFilter(input)}
    GROUP BY DATE_TRUNC('month', i.ts)
    ORDER BY DATE_TRUNC('month', i.ts) ASC
  `
}

export function buildUniqueArtistsValueSql(input: DateRangeInput): string {
  return `
    WITH ${TRACK_ARTISTS_CTE}
    SELECT CAST(COUNT(DISTINCT ta.artist_id) AS INTEGER) AS value
    FROM interactions i
    JOIN track_artists ta ON ta.track_id = i.track_id
    ${baseInteractionFilter(input)}
  `
}

export function buildUniqueArtistsTrendSql(input: DateRangeInput): string {
  return `
    WITH ${TRACK_ARTISTS_CTE}
    SELECT
      STRFTIME(DATE_TRUNC('month', i.ts), '%b %Y') AS label,
      CAST(COUNT(DISTINCT ta.artist_id) AS INTEGER) AS value
    FROM interactions i
    JOIN track_artists ta ON ta.track_id = i.track_id
    ${baseInteractionFilter(input)}
    GROUP BY DATE_TRUNC('month', i.ts)
    ORDER BY DATE_TRUNC('month', i.ts) ASC
  `
}

export function buildAvgDailyPlaytimeValueSql(input: DateRangeInput): string {
  return `
    SELECT CAST(ROUND(
      SUM(i.ms_played) / 60000.0 / NULLIF(COUNT(DISTINCT DATE(i.ts)), 0)
    ) AS INTEGER) AS value
    FROM interactions i
    ${baseInteractionFilter(input)}
  `
}

export function buildAvgDailyPlaytimeTrendSql(input: DateRangeInput): string {
  return `
    SELECT
      STRFTIME(DATE_TRUNC('month', i.ts), '%b %Y') AS label,
      CAST(ROUND(
        SUM(i.ms_played) / 60000.0 / NULLIF(COUNT(DISTINCT DATE(i.ts)), 0)
      ) AS INTEGER) AS value
    FROM interactions i
    ${baseInteractionFilter(input)}
    GROUP BY DATE_TRUNC('month', i.ts)
    ORDER BY DATE_TRUNC('month', i.ts) ASC
  `
}

export function buildAvgDailyPlaytimeDailySql(input: DateRangeInput): string {
  return `
    SELECT
      CAST(DATE(i.ts) AS VARCHAR) AS day,
      CAST(ROUND(SUM(i.ms_played) / 60000.0) AS INTEGER) AS value
    FROM interactions i
    ${baseInteractionFilter(input)}
    GROUP BY DATE(i.ts)
    ORDER BY DATE(i.ts) ASC
  `
}

export function buildPeakHourValueSql(input: DateRangeInput): string {
  return `
    SELECT CAST(hour_bucket AS INTEGER) AS value
    FROM (
      SELECT
        EXTRACT(HOUR FROM i.ts)::INTEGER AS hour_bucket,
        SUM(i.ms_played) AS total_ms
      FROM interactions i
      ${baseInteractionFilter(input)}
      GROUP BY hour_bucket
      ORDER BY total_ms DESC
      LIMIT 1
    )
  `
}

export function buildPeakHourTrendSql(input: DateRangeInput): string {
  return `
    SELECT
      LPAD(CAST(EXTRACT(HOUR FROM i.ts)::INTEGER AS VARCHAR), 2, '0') || ':00' AS label,
      CAST(ROUND(SUM(i.ms_played) / 60000.0) AS INTEGER) AS value
    FROM interactions i
    ${baseInteractionFilter(input)}
    GROUP BY EXTRACT(HOUR FROM i.ts)::INTEGER
    ORDER BY EXTRACT(HOUR FROM i.ts)::INTEGER ASC
  `
}

export function buildShuffleRateValueSql(input: DateRangeInput): string {
  return `
    SELECT ROUND(
      100.0 * COUNT(*) FILTER (WHERE i.shuffle) / NULLIF(COUNT(*), 0),
      1
    )::DOUBLE AS value
    FROM interactions i
    ${baseInteractionFilter(input)}
  `
}

export function buildShuffleRateTrendSql(input: DateRangeInput): string {
  return `
    SELECT
      STRFTIME(DATE_TRUNC('month', i.ts), '%b %Y') AS label,
      ROUND(
        100.0 * COUNT(*) FILTER (WHERE i.shuffle) / NULLIF(COUNT(*), 0),
        1
      )::DOUBLE AS value
    FROM interactions i
    ${baseInteractionFilter(input)}
    GROUP BY DATE_TRUNC('month', i.ts)
    ORDER BY DATE_TRUNC('month', i.ts) ASC
  `
}

export function buildOfflineRateValueSql(input: DateRangeInput): string {
  return `
    SELECT ROUND(
      100.0 * COUNT(*) FILTER (WHERE i.offline) / NULLIF(COUNT(*), 0),
      1
    )::DOUBLE AS value
    FROM interactions i
    ${baseInteractionFilter(input)}
  `
}

export function buildOfflineRateTrendSql(input: DateRangeInput): string {
  return `
    SELECT
      STRFTIME(DATE_TRUNC('month', i.ts), '%b %Y') AS label,
      ROUND(
        100.0 * COUNT(*) FILTER (WHERE i.offline) / NULLIF(COUNT(*), 0),
        1
      )::DOUBLE AS value
    FROM interactions i
    ${baseInteractionFilter(input)}
    GROUP BY DATE_TRUNC('month', i.ts)
    ORDER BY DATE_TRUNC('month', i.ts) ASC
  `
}
