import { db } from "@harmony/duckdb";

import { playsFrom } from "./filter";
import { containing, int, num, text, where } from "./sql";

export const COLUMNS = {
  played_at: { type: "timestamp", sql: "strftime(i.ts, '%Y-%m-%d %H:%M:%S')" },
  track: { type: "text", sql: "v.track_name" },
  artists: { type: "text", sql: "v.track_artists_description" },
  album: { type: "text", sql: "v.album_title" },
  album_artists: { type: "text", sql: "v.album_artists_description" },
  genres: { type: "text", sql: "array_to_string(al.genres, ', ')" },
  release_date: { type: "date", sql: "strftime(al.release_date, '%Y-%m-%d')" },
  ms_played: { type: "int", sql: "i.ms_played" },
  platform: { type: "text", sql: "i.platform" },
  skipped: { type: "bool", sql: "COALESCE(i.skipped, FALSE)" },
  shuffle: { type: "bool", sql: "COALESCE(i.shuffle, FALSE)" },
  offline: { type: "bool", sql: "COALESCE(i.offline, FALSE)" },
  track_id: { type: "int", sql: "i.track_id" },
} as const;

export type ColumnId = keyof typeof COLUMNS;

export type ColumnType = (typeof COLUMNS)[ColumnId]["type"];

export const COLUMN_IDS = Object.keys(COLUMNS) as ColumnId[];

export const OPS = {
  text: ["contains", "is", "not", "empty", "filled"],
  int: ["is", "not", "gt", "lt"],
  timestamp: ["contains", "gt", "lt"],
  date: ["contains", "gt", "lt", "empty", "filled"],
  bool: ["is"],
} as const;

export type ExportOp = (typeof OPS)[ColumnType][number];

export type ExportRule = { column: ColumnId; op: ExportOp; value: string };

export type ExportFilter = { from?: Date; to?: Date; rules: readonly ExportRule[] };

export type ExportQuery = ExportFilter & { sort: ColumnId; desc: boolean };

export type ExportCell = string | number | boolean | null;

export type ExportRow = Record<ColumnId, ExportCell>;

export const needsValue = (op: ExportOp) => op !== "empty" && op !== "filled";

const literal = (type: ColumnType, value: string) => {
  if (type === "int") return num(Number(value));
  if (type === "bool") return value === "true" ? "TRUE" : "FALSE";
  return text(value);
};

const condition = ({ column, op, value }: ExportRule) => {
  const name = `"${column}"`;
  const { type } = COLUMNS[column];
  if (op === "empty") return `NULLIF(CAST(${name} AS VARCHAR), '') IS NULL`;
  if (op === "filled") return `NULLIF(CAST(${name} AS VARCHAR), '') IS NOT NULL`;
  if (op === "contains") return `${name} ILIKE ${containing(value)}`;
  const symbol = { is: "=", not: "IS DISTINCT FROM", gt: ">", lt: "<" }[op];
  return `${name} ${symbol} ${literal(type, value)}`;
};

const namesSql = (list: string) => `
  (SELECT string_agg(COALESCE(a.name, ''), chr(31) ORDER BY u.n)
    FROM unnest(${list}) WITH ORDINALITY AS u(id, n) LEFT JOIN artists a ON a.id = u.id)`;

const playsSql = ({ from, to, rules }: ExportFilter) => `
  SELECT * FROM (
    SELECT i.ts, i.rowid AS seq, v.album_id,
      array_to_string(t.artists, ',') AS artist_ids, ${namesSql("t.artists")} AS artist_names,
      array_to_string(al.artists, ',') AS album_artist_ids, ${namesSql("al.artists")} AS album_artist_names,
      array_to_string(al.genres, chr(31)) AS genre_names,
      ${COLUMN_IDS.map((id) => `${COLUMNS[id].sql} AS "${id}"`).join(", ")}
    ${playsFrom({ from, to }, { needs: ["album"], joins: "JOIN v_tracks_info v ON v.track_id = i.track_id" })}
  )
  ${where(rules.filter((rule) => !needsValue(rule.op) || rule.value !== "").map(condition))}`;

const orderSql = ({ sort, desc }: ExportQuery) => {
  const dir = desc ? "DESC" : "ASC";
  return `ORDER BY "${sort}" ${dir} NULLS LAST, ts ${dir}, seq ${dir}`;
};

const select = (columns: readonly ColumnId[]) => columns.map((id) => `"${id}"`).join(", ");

type LinkedRow = ExportRow & {
  album_id: number | null;
  artist_ids: string | null;
  artist_names: string | null;
  album_artist_ids: string | null;
  album_artist_names: string | null;
  genre_names: string | null;
};

const SEPARATOR = String.fromCharCode(31);

const named = (ids: string | null, names: string | null) => {
  const labels = names?.split(SEPARATOR) ?? [];
  return (ids?.split(",") ?? []).map((id, index) => ({
    id: Number(id),
    name: labels[index] ?? "",
  }));
};

export const exportRowsFn = async (query: ExportQuery & { offset: number; limit: number }) => {
  const rows = await db.query<LinkedRow>(`
    SELECT ${select(COLUMN_IDS)}, album_id, artist_ids, artist_names, album_artist_ids,
      album_artist_names, genre_names
    FROM (${playsSql(query)})
    ${orderSql(query)}
    LIMIT ${int(query.limit)} OFFSET ${int(query.offset)}`);
  return rows.map(
    ({
      album_id,
      artist_ids,
      artist_names,
      album_artist_ids,
      album_artist_names,
      genre_names,
      ...cells
    }) => ({
      cells,
      album: album_id,
      artists: named(artist_ids, artist_names),
      albumArtists: named(album_artist_ids, album_artist_names),
      genres: genre_names?.split(SEPARATOR).filter((genre) => genre !== "") ?? [],
    }),
  );
};

export type ExportLine = Awaited<ReturnType<typeof exportRowsFn>>[number];

export const exportCountFn = async (filter: ExportFilter) => {
  const [row] = await db.query<{ n: number }>(
    `SELECT COUNT(*)::INTEGER AS n FROM (${playsSql(filter)})`,
  );
  return row?.n ?? 0;
};

const csvCell = (value: ExportCell) => {
  if (value === null) return "";
  const raw = String(value);
  return /[",\n\r]/.test(raw) ? `"${raw.replaceAll('"', '""')}"` : raw;
};

export const exportCsvFn = async (query: ExportQuery, columns: readonly ColumnId[]) => {
  const rows = await db.query<ExportRow>(`
    SELECT ${select(columns)} FROM (${playsSql(query)})
    ${orderSql(query)}`);
  const lines = rows.map((row) => columns.map((id) => csvCell(row[id])).join(","));
  return [columns.join(","), ...lines].join("\n");
};
