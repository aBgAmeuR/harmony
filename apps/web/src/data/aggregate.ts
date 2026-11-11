import { db } from "@harmony/duckdb";

import { playsFrom, type Filter, type Join } from "./filter";
import { measure, type MeasureId, type Values } from "./measures";
import { day, int, text } from "./sql";

export type Unit = "day" | "week" | "month";
type Grain = Unit | "year";

// What the plays are grouped by. `bucket` counts days, weeks or months from `origin`, so two
// periods of the same length line up index by index.
export type By =
  | "all"
  | "track"
  | "album"
  | "artist"
  | "genre"
  | "platform"
  | "releaseYear"
  | "hour"
  | Grain
  | { bucket: Unit; origin: Date; count: number };

// Albums the catalog does not know are grouped under this id.
export const UNKNOWN_ALBUM = -1;

// One rule for every chart over a period: days under a month, weeks under half a year, months above.
export const unitFor = (days: number): Unit => {
  if (days < 31) return "day";
  return days < 183 ? "week" : "month";
};

type Key = {
  sql: string;
  needs?: Join;
  joins?: string;
  conditions?: string[];
  date?: boolean;
};

const bucketIndex = (unit: Unit, origin: Date): string => {
  const from = day(origin);
  if (unit === "month") {
    return `date_diff('month', date_trunc('month', ${from})::DATE, date_trunc('month', i.ts)::DATE)::INTEGER`;
  }
  const days = `date_diff('day', ${from}, CAST(i.ts AS DATE))`;
  return unit === "week" ? `(${days} // 7)::INTEGER` : `${days}::INTEGER`;
};

const keyOf = (by: By): Key => {
  if (typeof by === "object") return { sql: bucketIndex(by.bucket, by.origin) };
  switch (by) {
    case "all":
      return { sql: "0" };
    case "track":
      return { sql: "i.track_id" };
    case "album":
      // UINTEGER ids mixed with -1 would come back as BIGINT, which Arrow returns as BigInt.
      return { sql: `COALESCE(t.album_id, ${UNKNOWN_ALBUM})::INTEGER`, needs: "track" };
    case "artist":
      return {
        sql: "u.artist_id",
        needs: "track",
        joins: "CROSS JOIN unnest(t.artists) AS u(artist_id)",
      };
    case "genre":
      return {
        sql: "g.genre",
        needs: "album",
        joins: "CROSS JOIN unnest(al.genres) AS g(genre)",
        conditions: ["g.genre IS NOT NULL", "g.genre <> ''"],
      };
    case "platform":
      return { sql: "i.platform", conditions: ["i.platform IS NOT NULL"] };
    case "releaseYear":
      // Some catalog dates are placeholders such as year 10.
      return {
        sql: "EXTRACT(YEAR FROM al.release_date)::INTEGER",
        needs: "album",
        conditions: ["al.release_date >= DATE '1900-01-01'"],
      };
    case "hour":
      // Plays are stored in UTC: hours come back as instants for the browser to place in local time.
      return { sql: "epoch(date_trunc('hour', i.ts))::DOUBLE" };
    default:
      return { sql: `date_trunc('${by}', i.ts)::DATE`, date: true };
  }
};

const COLUMNS: Record<Join | "play", string> = {
  play: "i.ts, i.platform, i.ms_played, i.shuffle, i.skipped, i.offline, i.track_id",
  track: "t.duration, t.album_id, t.artists",
  album: "al.genres, al.release_date, al.album_type",
};

// Every bucket of the period, so empty ones are returned too.
const seriesOf = (by: By | undefined, filter: Filter): string | null => {
  if (by === undefined) return null;
  if (typeof by === "object") return `SELECT range::INTEGER AS key FROM range(0, ${int(by.count)})`;
  if (!["day", "week", "month", "year"].includes(by) || !filter.from || !filter.to) return null;
  return `
    SELECT generate_series::DATE AS key
    FROM generate_series(
      date_trunc('${by}', ${day(filter.from)})::DATE,
      date_trunc('${by}', ${day(filter.to)})::DATE,
      INTERVAL 1 ${by.toUpperCase()}
    )`;
};

type AggregateQuery<M extends MeasureId> = {
  by: By;
  measures: readonly M[];
  filter: Filter;
  // Returns every bucket of a period, empty ones with zeros.
  fill?: boolean;
  // Only these groups.
  keys?: readonly (number | string)[];
  // Also splits each group by day, week or month of the period, in a `period` column.
  over?: Unit;
};

// One row per group: `key` and one column per measure.
export const aggregateSql = <M extends MeasureId>({
  by,
  measures: ids,
  filter,
  fill = false,
  keys,
  over,
}: AggregateQuery<M>): string => {
  const key = keyOf(by);
  const needs = [key.needs, ...ids.map((id) => measure(id).needs)];
  const joined = new Set(needs.filter((need) => need !== undefined));
  const track = joined.has("track") || joined.has("album");
  const columns = [
    COLUMNS.play,
    ...(track ? [COLUMNS.track] : []),
    ...(joined.has("album") ? [COLUMNS.album] : []),
  ];

  const grouped = by !== "all";
  const groupColumns = over ? "key, period" : "key";
  const groupBy = grouped ? `GROUP BY ${groupColumns}` : "";
  const keyColumn = grouped ? groupColumns : "0 AS key";
  const keyList = (keys ?? []).map((k) => (typeof k === "number" ? int(k) : text(k))).join(", ");
  const plain = ids.filter((id) => measure(id).sql !== null);
  const artists = ids.some((id) => id === "artists");

  const ctes = [
    `base AS (
      SELECT ${key.sql} AS key,
        ${over ? `date_trunc('${over}', i.ts)::DATE AS period,` : ""}
        ${columns.join(", ")}
      ${playsFrom(filter, {
        needs,
        joins: key.joins,
        conditions: [
          ...(key.conditions ?? []),
          ...(keys ? [`${key.sql} IN (${keyList || "NULL"})`] : []),
        ],
      })}
    )`,
    `agg AS (
      SELECT ${[keyColumn, ...plain.map((id) => `${measure(id).sql} AS "${id}"`)].join(", ")}
      FROM base
      ${groupBy}
    )`,
    ...(artists
      ? [
          `art AS (
            SELECT ${keyColumn}, COUNT(DISTINCT a.artist_id)::INTEGER AS artists
            FROM base
            CROSS JOIN unnest(base.artists) AS a(artist_id)
            ${groupBy}
          )`,
        ]
      : []),
  ];

  // Every requested group gets every bucket of the period.
  const grid =
    fill && over && keys
      ? `SELECT w.key, s.key AS period
         FROM (SELECT UNNEST([${keyList}]) AS key) w
         CROSS JOIN (${seriesOf(over, filter)}) s`
      : null;
  const series = grid ?? (fill ? seriesOf(by, filter) : null);
  if (series) ctes.push(`series AS (${series})`);

  const value = (id: M): string => {
    const column = id === "artists" ? "art.artists" : `agg."${id}"`;
    return series && measure(id).kind !== "date"
      ? `COALESCE(${column}, 0) AS "${id}"`
      : `${column} AS "${id}"`;
  };

  const root = series ? "series" : "agg";
  const on = (table: string) =>
    over
      ? `${table}.key = ${root}.key AND ${table}.period = ${root}.period`
      : `${table}.key = ${root}.key`;
  const keyOut = key.date ? `strftime(${root}.key, '%Y-%m-%d') AS key` : `${root}.key AS key`;
  const periodOut = over ? [`strftime(${root}.period, '%Y-%m-%d') AS period`] : [];

  return `
    WITH ${ctes.join(",\n")}
    SELECT ${[keyOut, ...periodOut, ...ids.map(value)].join(", ")}
    FROM ${root}
    ${series ? `LEFT JOIN agg ON ${on("agg")}` : ""}
    ${artists ? `LEFT JOIN art ON ${on("art")}` : ""}
    ${series ? `ORDER BY ${over ? `${root}.key, ${root}.period` : `${root}.key`}` : ""}`;
};

export type Row<M extends MeasureId, K = number> = { key: K; period?: string } & Values<M>;

export const aggregate = <M extends MeasureId, K extends number | string = number>(
  query: AggregateQuery<M>,
): Promise<Row<M, K>[]> => db.query<Row<M, K>>(aggregateSql(query));

// The measures over every play of the filter.
export const totals = async <M extends MeasureId>(
  filter: Filter,
  ids: readonly M[],
): Promise<Values<M>> => {
  // Without GROUP BY the aggregate always returns one row, zeros included.
  const [row] = await aggregate({ by: "all", measures: ids, filter });
  if (!row) throw new Error("totals returned no row");
  return row;
};

export type Series<M extends MeasureId> = { unit: Unit; points: Row<M, string>[] };

// The measures per day, week or month of the filter's period, empty buckets included.
export const series = async <M extends MeasureId>(
  filter: Filter & { from: Date; to: Date },
  ids: readonly M[],
  unit: Unit,
): Promise<Series<M>> => ({
  unit,
  points: await aggregate<M, string>({ by: unit, measures: ids, filter, fill: true }),
});
