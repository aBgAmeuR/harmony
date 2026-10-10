import { db } from "@harmony/duckdb";

import type { Scope } from "@/shared/scope";

import { interactionDateConditions, joinWhere } from "./sql/date-range";

export type RankBy = "artist" | "track" | "album";
export type RankSort = "playtime" | "streams";

export type RankRow = {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  streams: number;
  playtime: number;
};

type RankArgs = {
  by: RankBy;
  scope: Scope;
  sort?: RankSort;
  limit?: number;
};

const byTrack = ({ artistId, from, to }: Scope) => `
  SELECT
    v.track_id AS id,
    ANY_VALUE(v.track_name) AS name,
    ANY_VALUE(v.track_artists_description) AS description,
    ANY_VALUE(v.image) AS image,
    COUNT(*)::INTEGER AS streams,
    SUM(i.ms_played) / 60000::INTEGER AS playtime
  FROM interactions i
  JOIN v_tracks_info v ON v.track_id = i.track_id
  ${joinWhere([
    ...interactionDateConditions(from, to),
    ...(artistId ? [`v.track_artist_ids @> ARRAY[${artistId}]`] : []),
  ])}
  GROUP BY v.track_id
`;

const byAlbum = ({ artistId, from, to }: Scope) => `
  SELECT
    v.album_id AS id,
    ANY_VALUE(v.album_title) AS name,
    ANY_VALUE(v.album_artists_description) AS description,
    ANY_VALUE(v.image) AS image,
    COUNT(*)::INTEGER AS streams,
    SUM(i.ms_played) / 60000::INTEGER AS playtime
  FROM interactions i
  JOIN v_tracks_info v ON v.track_id = i.track_id
  ${joinWhere([
    ...interactionDateConditions(from, to),
    ...(artistId ? [`v.album_artist_ids @> ARRAY[${artistId}]`] : []),
  ])}
  GROUP BY v.album_id
`;

const byArtist = ({ from, to }: Scope) => `
  WITH track_stats AS (
    SELECT
      i.track_id,
      COUNT(*)::INTEGER AS streams,
      SUM(i.ms_played) AS ms_played
    FROM interactions i
    ${joinWhere(interactionDateConditions(from, to))}
    GROUP BY i.track_id
  )
  SELECT
    a.id AS id,
    ANY_VALUE(a.name) AS name,
    NULL AS description,
    ANY_VALUE(a.image) AS image,
    SUM(ts.streams)::INTEGER AS streams,
    (SUM(ts.ms_played) / 60000)::INTEGER AS playtime
  FROM track_stats ts
  JOIN tracks t ON t.id = ts.track_id
  CROSS JOIN unnest(t.artists) AS u(artist_id)
  JOIN artists a ON a.id = u.artist_id
  GROUP BY a.id
`;

const sources = { artist: byArtist, track: byTrack, album: byAlbum };

export const rankFn = ({ by, scope, sort = "playtime", limit = 50 }: RankArgs) =>
  db.query<RankRow>(`
    SELECT * FROM (${sources[by](scope)})
    ORDER BY ${sort} DESC
    LIMIT ${Math.trunc(limit)}
  `);
