import type { TopCatalogInput } from './types'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function assertDate(value: string, field: 'from' | 'to') {
  if (value && !DATE_PATTERN.test(value)) {
    throw new Error(`Invalid ${field} date: expected YYYY-MM-DD`)
  }
}

function interactionDateFilter(from: string, to: string): string {
  assertDate(from, 'from')
  assertDate(to, 'to')

  if (!from && !to) return ''

  const clauses: Array<string> = []
  if (from) clauses.push(`i.ts >= '${from}'`)
  if (to) clauses.push(`i.ts < '${to}'`)

  return `AND ${clauses.join(' AND ')}`
}

export function buildTopTracksSql({ size, from, to }: TopCatalogInput): string {
  return `
    SELECT
      t.id,
      t.title AS name,
      (SELECT STRING_AGG(name, ', ') FROM artists WHERE list_contains(t.artists, id)) AS description,
      al.cover AS image,
      COUNT(*)::INTEGER AS streams,
      ROUND(SUM(i.ms_played) / 60000.0, 2)::DOUBLE AS playtime
    FROM tracks t
    JOIN interactions i ON t.id = i.track_id
    LEFT JOIN albums al ON t.album_id = al.id
    WHERE i.skipped = false
    ${interactionDateFilter(from, to)}
    GROUP BY
      t.id,
      t.title,
      al.cover,
      t.artists
    ORDER BY
      streams DESC,
      playtime DESC
    LIMIT ${size};
  `
}

export function buildTopAlbumsSql({ size, from, to }: TopCatalogInput): string {
  return `
    WITH album_artists AS (
      SELECT
        al.id AS album_id,
        STRING_AGG(DISTINCT a.name, ', ' ORDER BY a.name) AS artist_names
      FROM albums al,
      unnest(al.artists) AS u(artist_id)
      JOIN artists a ON a.id = u.artist_id
      GROUP BY al.id
    )
    SELECT
      al.id                                           AS id,
      al.title                                        AS name,
      COALESCE(aa.artist_names, '')                   AS description,
      COALESCE(al.cover, '')                          AS image,
      CAST(COUNT(*) AS INTEGER)                       AS streams,
      CAST(SUM(i.ms_played) / 1000 / 60 AS INTEGER) AS playtime
    FROM interactions i
    JOIN tracks t  ON t.id  = i.track_id
    JOIN albums al ON al.id = t.album_id
    LEFT JOIN album_artists aa ON aa.album_id = al.id
    WHERE i.skipped = false
    ${interactionDateFilter(from, to)}
    GROUP BY al.id, al.title, al.cover, aa.artist_names
    ORDER BY playtime DESC
    LIMIT ${size}
  `
}

export function buildTopArtistsSql({ size, from, to }: TopCatalogInput): string {
  return `
    WITH track_artists AS (
      SELECT
        t.id AS track_id,
        u.artist_id
      FROM tracks t,
      unnest(t.artists) AS u(artist_id)
    )
    SELECT
      ar.id                                            AS id,
      ar.name                                          AS name,
      COALESCE(ar.picture, '')                         AS image,
      CAST(COUNT(*) AS INTEGER)                        AS streams,
      CAST(SUM(i.ms_played) / 1000 / 60 AS INTEGER)  AS playtime
    FROM interactions i
    JOIN tracks t ON t.id = i.track_id
    JOIN track_artists ta ON ta.track_id = i.track_id
    JOIN artists ar ON ar.id = ta.artist_id
    WHERE i.skipped = false
    ${interactionDateFilter(from, to)}
    GROUP BY ar.id, ar.name, ar.picture
    ORDER BY playtime DESC
    LIMIT ${size}
  `
}
