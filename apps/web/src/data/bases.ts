import { db } from "@harmony/duckdb";

import type { Kind } from "@/shared/lib/format";

import { rangeDays } from "@/shared/lib/date";

import { aggregate, aggregateSql, UNKNOWN_ALBUM, unitFor, type By, type Unit } from "./aggregate";
import { playsFrom, type Filter, type Op } from "./filter";
import { measure, type MeasureId } from "./measures";
import { containing, int, num, picture, text, where } from "./sql";

// Notion-like databases: one per resource. Every row has an id, a name, an optional description and
// picture, plus the properties of its base. Views pick, sort and filter those properties.

type PropKind = Kind | "date" | "text" | "flag";

export type Prop = {
  label: string;
  kind: PropKind;
};

export type ViewType = "table" | "gallery";

export type Opens = "track" | "album" | "artist" | "genre";

const BASE_IDS = ["artists", "tracks", "albums", "genres", "plays"] as const;

export type BaseId = (typeof BASE_IDS)[number];

// The bases the Explorer shows: rankings of what was played. Plays feed the track panel.
export const EXPLORER_BASES = ["artists", "albums", "tracks", "genres"] as const;

export type ExplorerBaseId = (typeof EXPLORER_BASES)[number];

export type Base = {
  id: BaseId;
  title: string;
  props: Record<string, Prop>;
  views: readonly ViewType[];
  defaults: { sort: string; desc: boolean };
  by?: By;
  opens: Opens;
  source: (filter: Filter) => string;
};

const measureProps = (ids: readonly MeasureId[]) =>
  Object.fromEntries(ids.map((id) => [id, { label: measure(id).label, kind: measure(id).kind }]));

const grouped = (by: By, ids: readonly MeasureId[], filter: Filter) =>
  `(${aggregateSql({ by, measures: ids, filter })}) m`;

const measureColumns = (ids: readonly MeasureId[]) => ids.map((id) => `m."${id}"`).join(", ");

const ENTITY = ["playtime", "streams", "skipRate", "days", "firstPlayed", "lastPlayed"] as const;

const artists: Base = (() => {
  const ids = [...ENTITY, "tracks", "albums"] as const;
  return {
    id: "artists",
    title: "Artists",
    props: measureProps(ids),
    views: ["table", "gallery"],
    defaults: { sort: "playtime", desc: true },
    by: "artist",
    opens: "artist",
    source: (filter) => `
      SELECT m.key AS id, a.name, NULL::VARCHAR AS description, a.image, ${picture("a")} AS cover,
        ${measureColumns(ids)}
      FROM ${grouped("artist", ids, filter)}
      JOIN artists a ON a.id = m.key`,
  };
})();

const tracks: Base = (() => {
  const ids = [...ENTITY, "completion"] as const;
  return {
    id: "tracks",
    title: "Tracks",
    props: {
      ...measureProps(ids),
      album: { label: "Album", kind: "text" },
      releaseYear: { label: "Release year", kind: "text" },
    },
    views: ["table", "gallery"],
    defaults: { sort: "playtime", desc: true },
    by: "track",
    opens: "track",
    source: (filter) => `
      SELECT m.key AS id, v.track_name AS name, v.track_artists_description AS description,
        v.image, ${picture("v")} AS cover,
        v.album_title AS album, strftime(t.release_date, '%Y') AS "releaseYear",
        ${measureColumns(ids)}
      FROM ${grouped("track", ids, filter)}
      JOIN v_tracks_info v ON v.track_id = m.key
      JOIN tracks t ON t.id = m.key`,
  };
})();

const albums: Base = (() => {
  const ids = [...ENTITY, "tracks"] as const;
  return {
    id: "albums",
    title: "Albums",
    props: {
      ...measureProps(ids),
      albumType: { label: "Type", kind: "text" },
      releaseYear: { label: "Release year", kind: "text" },
    },
    views: ["table", "gallery"],
    defaults: { sort: "playtime", desc: true },
    by: "album",
    opens: "album",
    source: (filter) => `
      SELECT m.key AS id, COALESCE(al.title, 'Unknown album') AS name,
        (
          SELECT string_agg(a.name, ', ' ORDER BY u.n)
          FROM unnest(al.artists) WITH ORDINALITY AS u(artist_id, n)
          JOIN artists a ON a.id = u.artist_id
        ) AS description,
        al.image, ${picture("al")} AS cover,
        al.album_type AS "albumType", strftime(al.release_date, '%Y') AS "releaseYear",
        ${measureColumns(ids)}
      FROM ${grouped("album", ids, filter)}
      LEFT JOIN albums al ON al.id = m.key AND m.key <> ${UNKNOWN_ALBUM}`,
  };
})();

const genres: Base = (() => {
  const ids = [...ENTITY, "tracks", "artists", "albums"] as const;
  return {
    id: "genres",
    title: "Genres",
    props: measureProps(ids),
    views: ["table"],
    defaults: { sort: "playtime", desc: true },
    by: "genre",
    opens: "genre",
    source: (filter) => `
      SELECT m.key AS id, m.key AS name, NULL::VARCHAR AS description,
        NULL::VARCHAR AS image, NULL::VARCHAR AS cover, ${measureColumns(ids)}
      FROM ${grouped("genre", ids, filter)}`,
  };
})();

const plays: Base = {
  id: "plays",
  title: "Plays",
  props: {
    played: { label: "Played at", kind: "date" },
    playtime: { label: "Time listened", kind: "minutes" },
    platform: { label: "Platform", kind: "text" },
    skipped: { label: "Skipped", kind: "flag" },
    shuffle: { label: "Shuffle", kind: "flag" },
    offline: { label: "Offline", kind: "flag" },
  },
  views: ["table"],
  defaults: { sort: "played", desc: true },
  opens: "track",
  source: (filter) => `
    SELECT
      ROW_NUMBER() OVER (ORDER BY i.ts, i.track_id)::INTEGER AS id,
      v.track_name AS name, v.track_artists_description AS description, v.image,
      v.image AS cover, i.track_id AS track,
      strftime(i.ts, '%Y-%m-%d %H:%M:%S') AS played,
      (i.ms_played / 60000.0)::DOUBLE AS playtime,
      i.platform,
      COALESCE(i.skipped, FALSE) AS skipped,
      COALESCE(i.shuffle, FALSE) AS shuffle,
      COALESCE(i.offline, FALSE) AS offline
    ${playsFrom(filter, { joins: "JOIN v_tracks_info v ON v.track_id = i.track_id" })}`,
};

// A new session starts after 30 minutes without a play.
const SESSION_GAP_SECONDS = 30 * 60;

// Sessions of two plays at least.
export const sessionsSql = (filter: Filter) => `
  WITH ordered AS (
    SELECT i.ts, i.ms_played, i.track_id,
      LAG(i.ts) OVER (ORDER BY i.ts, i.ms_played) AS prev_ts
    ${playsFrom(filter)}
  ),
  numbered AS (
    SELECT *,
      SUM(CASE WHEN prev_ts IS NULL OR date_diff('second', prev_ts, ts) > ${SESSION_GAP_SECONDS}
        THEN 1 ELSE 0 END) OVER (ORDER BY ts, ms_played ROWS UNBOUNDED PRECEDING) AS session
    FROM ordered
  )
  SELECT
    session::INTEGER AS id,
    MIN(ts) AS started,
    (date_diff('millisecond', MIN(ts), MAX(ts)) + arg_max(ms_played, ts)) AS duration_ms,
    COUNT(*)::INTEGER AS streams,
    COUNT(DISTINCT track_id)::INTEGER AS tracks
  FROM numbered
  GROUP BY session
  HAVING COUNT(*) >= 2`;

export const bases = {
  artists,
  tracks,
  albums,
  genres,
  plays,
} as const;

// A filter on a row property, such as "streams > 10". Play fields go into the filter instead.
export type Condition = { prop: string; op: Op; value: string | number | boolean };

export type ListQuery = {
  base: BaseId;
  filter: Filter;
  conditions?: readonly Condition[];
  search?: string;
  sort: string;
  desc: boolean;
  limit: number;
  previous?: Filter;
};

export type ListRow = {
  id: number | string;
  name: string;
  description: string | null;
  image: string | null;
  cover: string | null;
  rank: number;
  prevRank: number | null;
  track?: number;
  [prop: string]: string | number | boolean | null | undefined;
};

// `base` lets a view keep showing the previous list only while the base stays the same.
export type List = { base: BaseId; rows: ListRow[]; total: number };

const KINDS_NUMERIC = new Set<PropKind>(["count", "compact", "percent", "minutes", "ratio"]);

const conditionSql = (base: Base, { prop, op, value }: Condition) => {
  const def = Object.hasOwn(base.props, prop) ? base.props[prop] : undefined;
  if (!def) return null;
  const column = `"${prop}"`;
  if (def.kind === "flag") return (op === "not") === Boolean(value) ? `NOT ${column}` : column;
  const literal = KINDS_NUMERIC.has(def.kind) ? num(Number(value)) : text(String(value));
  return `${column} ${{ is: "=", not: "<>", gt: ">", lt: "<" }[op]} ${literal}`;
};

const sortColumn = (base: Base, sort: string) =>
  sort === "name" || sort === "id" || Object.hasOwn(base.props, sort) ? `"${sort}"` : "id";

const rankedSql = (
  base: Base,
  filter: Filter,
  query: Pick<ListQuery, "conditions" | "sort" | "desc">,
) => {
  const conditions = (query.conditions ?? []).flatMap((c) => conditionSql(base, c) ?? []);
  const direction = query.desc ? "DESC" : "ASC";
  return `
    SELECT *, ROW_NUMBER() OVER (
      ORDER BY ${sortColumn(base, query.sort)} ${direction} NULLS LAST, name ASC, id ASC
    )::INTEGER AS rank
    FROM (${base.source(filter)}) s
    ${where(conditions)}`;
};

const listSql = (query: ListQuery) => {
  const base = bases[query.base];
  const term = query.search?.trim() ?? "";
  const previous = query.previous && base.by ? query.previous : null;

  return `
    WITH cur AS (${rankedSql(base, query.filter, query)})
    ${previous ? `, prev AS (${rankedSql(base, previous, query)})` : ""}
    SELECT cur.*, ${previous ? "prev.rank" : "NULL::INTEGER"} AS "prevRank",
      (COUNT(*) OVER ())::INTEGER AS total
    FROM cur
    ${previous ? "LEFT JOIN prev ON prev.id = cur.id" : ""}
    ${term ? `WHERE (cur.name ILIKE ${containing(term)} OR cur.description ILIKE ${containing(term)})` : ""}
    ORDER BY cur.rank
    LIMIT ${int(query.limit)}`;
};

export const listFn = async (query: ListQuery): Promise<List> => {
  const rows = await db.query<ListRow & { total: number }>(listSql(query));
  return { base: query.base, rows, total: rows[0]?.total ?? 0 };
};

type RankRow = { rank: number; total: number; prevRank: number | null };

export const rankFn = async ({
  base,
  id,
  filter,
  previous,
}: {
  base: BaseId;
  id: number | string;
  filter: Filter;
  previous: Filter;
}) => {
  const by = { sort: "playtime", desc: true };
  const [row] = await db.query<RankRow>(`
    WITH cur AS (${rankedSql(bases[base], filter, by)}),
      prev AS (${rankedSql(bases[base], previous, by)})
    SELECT cur.rank, (SELECT COUNT(*) FROM cur)::INTEGER AS total, prev.rank AS "prevRank"
    FROM cur LEFT JOIN prev ON prev.id = cur.id
    WHERE cur.id = ${typeof id === "number" ? int(id) : text(id)}`);
  return row ?? null;
};

export const rankTrendFn = async ({
  base,
  id,
  filter,
}: {
  base: BaseId;
  id: number | string;
  filter: Filter;
}) => {
  const { by } = bases[base];
  if (!by) return [];
  return await db.query<{ label: string; rank: number }>(`
    WITH ranked AS (
      SELECT key, period, RANK() OVER (PARTITION BY period ORDER BY playtime DESC)::INTEGER AS rank
      FROM (${aggregateSql({ by, measures: ["playtime"], filter, over: "month" })})
    )
    SELECT period AS label, rank FROM ranked
    WHERE key = ${typeof id === "number" ? int(id) : text(id)}
    ORDER BY period`);
};

type TrendPoint = { period: string; playtime: number; streams: number };

export type Trends = { base: BaseId; unit: Unit; points: Record<string, TrendPoint[]> };

export const trendsFn = async ({
  base,
  ids,
  filter,
}: {
  base: BaseId;
  ids: readonly (number | string)[];
  filter: Filter & { from: Date; to: Date };
}) => {
  const { by } = bases[base];
  const unit = unitFor(rangeDays(filter));
  if (!by || ids.length === 0) return { base, unit, points: {} };

  const rows = await aggregate<"playtime" | "streams", number | string>({
    by,
    measures: ["playtime", "streams"],
    filter,
    keys: ids,
    over: unit,
    fill: true,
  });
  const points: Record<string, TrendPoint[]> = {};
  for (const { key, period = "", playtime, streams } of rows) {
    (points[String(key)] ??= []).push({ period, playtime, streams });
  }
  return { base, unit, points };
};

export type TopRow = {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  cover: string | null;
  streams: number;
  playtime: number;
};

export const topFn = async ({
  base,
  filter,
  sort = "playtime",
  limit,
  search,
}: {
  base: "artists" | "tracks" | "albums";
  filter: Filter;
  sort?: "playtime" | "streams";
  limit: number;
  search?: string;
}) => {
  const { rows } = await listFn({ base, filter, sort, desc: true, limit, search });
  return rows.map((row) => ({
    id: Number(row.id),
    name: row.name,
    description: row.description,
    image: row.image,
    cover: row.cover,
    streams: Number(row.streams),
    playtime: Number(row.playtime),
  }));
};
