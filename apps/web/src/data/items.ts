import { db } from "@harmony/duckdb";

import type { Range } from "@/shared/lib/date";

import { playsFrom, type Rule } from "./filter";
import { int, picture, text } from "./sql";

// The resources that have a page (or a panel) of their own.
type ItemKind = "artist" | "album" | "track" | "genre";

export type ItemRef = { kind: ItemKind; id: number | string };

// The plays of one item, as a filter rule.
export const itemRule = ({ kind, id }: ItemRef): Rule => ({
  field: kind,
  op: "is",
  value: kind === "genre" ? String(id) : Number(id),
});

type Named = { id: number; name: string };

export type Item = {
  kind: ItemKind;
  id: number | string;
  name: string;
  image: string | null;
  artists: Named[];
  album: Named | null;
  // Album details.
  type: string | null;
  releaseDate: string | null;
  trackCount: number | null;
};

type ItemRow = {
  name: string;
  image: string | null;
  type: string | null;
  release_date: string | null;
  track_count: number | null;
  album_id: number | null;
  album_name: string | null;
  artist_id: number | null;
  artist_name: string | null;
};

const artistsOf = (list: string) => `
  LEFT JOIN unnest(${list}) WITH ORDINALITY AS u(artist_id, position) ON TRUE
  LEFT JOIN artists a ON a.id = u.artist_id`;

const sqlOf = ({ kind, id }: ItemRef): string => {
  switch (kind) {
    case "artist":
      return `
        SELECT a.name, ${picture("a")} AS image, NULL AS type, NULL AS release_date,
          NULL::INTEGER AS track_count, NULL::INTEGER AS album_id, NULL AS album_name,
          NULL::INTEGER AS artist_id, NULL AS artist_name
        FROM artists a WHERE a.id = ${int(Number(id))}`;
    case "album":
      return `
        SELECT al.title AS name, ${picture("al")} AS image, al.album_type AS type,
          CAST(al.release_date AS VARCHAR) AS release_date,
          GREATEST(
            COALESCE(al.nb_tracks, 0),
            (SELECT COUNT(*) FROM tracks t WHERE t.album_id = al.id)
          )::INTEGER AS track_count,
          NULL::INTEGER AS album_id, NULL AS album_name, a.id AS artist_id, a.name AS artist_name
        FROM albums al ${artistsOf("al.artists")}
        WHERE al.id = ${int(Number(id))}
        ORDER BY u.position`;
    case "track":
      return `
        SELECT t.title AS name, ${picture("al")} AS image, NULL AS type,
          CAST(t.release_date AS VARCHAR) AS release_date, NULL::INTEGER AS track_count,
          al.id AS album_id, al.title AS album_name, a.id AS artist_id, a.name AS artist_name
        FROM tracks t LEFT JOIN albums al ON al.id = t.album_id ${artistsOf("t.artists")}
        WHERE t.id = ${int(Number(id))}
        ORDER BY u.position`;
    case "genre":
      return `
        SELECT ${text(String(id))} AS name, NULL AS image, NULL AS type, NULL AS release_date,
          NULL::INTEGER AS track_count, NULL::INTEGER AS album_id, NULL AS album_name,
          NULL::INTEGER AS artist_id, NULL AS artist_name
        FROM albums WHERE list_contains(genres, ${text(String(id))})
        LIMIT 1`;
  }
};

// What a page shows about an item, null when the package does not know it.
export const itemFn = async (ref: ItemRef): Promise<Item | null> => {
  const rows = await db.query<ItemRow>(sqlOf(ref));
  const [first] = rows;
  if (!first) return null;
  return {
    ...ref,
    name: first.name,
    image: first.image,
    type: first.type,
    releaseDate: first.release_date,
    trackCount: first.track_count,
    album:
      first.album_id !== null && first.album_name !== null
        ? { id: first.album_id, name: first.album_name }
        : null,
    artists: rows.flatMap((row) =>
      row.artist_id !== null && row.artist_name !== null
        ? [{ id: row.artist_id, name: row.artist_name }]
        : [],
    ),
  };
};

export type AlbumTrack = {
  id: number;
  name: string;
  description: string | null;
  streams: number;
  playtime: number;
};

// Every track of the album known to the package in album order, played in the period or not.
export const albumTracksFn = async ({
  albumId,
  range,
}: {
  albumId: number;
  range: Range;
}): Promise<AlbumTrack[]> =>
  await db.query<AlbumTrack>(`
    SELECT
      v.track_id AS id,
      v.track_name AS name,
      v.track_artists_description AS description,
      COALESCE(s.streams, 0)::INTEGER AS streams,
      COALESCE(s.playtime, 0)::DOUBLE AS playtime
    FROM v_tracks_info v
    JOIN tracks t ON t.id = v.track_id
    LEFT JOIN (
      SELECT i.track_id, COUNT(*) AS streams, SUM(i.ms_played) / 60000.0 AS playtime
      ${playsFrom(range)}
      GROUP BY i.track_id
    ) s ON s.track_id = v.track_id
    WHERE v.album_id = ${int(albumId)}
    ORDER BY t.disk_number NULLS LAST, t.track_position NULLS LAST, v.track_name
  `);
