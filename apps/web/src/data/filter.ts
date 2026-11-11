import type { Scope } from "@/shared/scope";

import { day, int, num, text, where } from "./sql";

// Tables a play can be joined to: `t` (tracks) and `al` (albums, through the track).
export type Join = "track" | "album";

type FieldType = "id" | "number" | "text" | "list" | "flag";

type Field = {
  label: string;
  type: FieldType;
  sql: string;
  needs?: Join;
};

// Everything a play can be filtered on. Rules on these narrow the plays before anything is counted.
const fieldList = {
  artist: { label: "Artist", type: "list", sql: "t.artists", needs: "track" },
  albumArtist: { label: "Album artist", type: "list", sql: "al.artists", needs: "album" },
  album: { label: "Album", type: "id", sql: "t.album_id", needs: "track" },
  track: { label: "Track", type: "id", sql: "i.track_id" },
  genre: { label: "Genre", type: "list", sql: "al.genres", needs: "album" },
  platform: { label: "Platform", type: "text", sql: "i.platform" },
  albumType: { label: "Album type", type: "text", sql: "al.album_type", needs: "album" },
  releaseYear: {
    label: "Release year",
    type: "number",
    sql: "EXTRACT(YEAR FROM al.release_date)",
    needs: "album",
  },
  shuffle: { label: "Shuffle", type: "flag", sql: "COALESCE(i.shuffle, FALSE)" },
  skipped: { label: "Skipped", type: "flag", sql: "COALESCE(i.skipped, FALSE)" },
  offline: { label: "Offline", type: "flag", sql: "COALESCE(i.offline, FALSE)" },
} satisfies Record<string, Field>;

export type FieldId = keyof typeof fieldList;

export const fields: Record<FieldId, Field> = fieldList;

export const isField = (name: string): name is FieldId => Object.hasOwn(fields, name);

export type Op = "is" | "not" | "gt" | "lt";

export type Rule = { field: FieldId; op: Op; value: string | number | boolean };

// The plays a figure counts: a period (none means the whole history) and rules on fields.
export type Filter = { from?: Date; to?: Date; rules?: readonly Rule[] };

const literal = (type: FieldType, value: Rule["value"]): string => {
  if (type === "text") return text(String(value));
  if (type === "number") return num(Number(value));
  return int(Number(value));
};

const condition = ({ field, op, value }: Rule): string => {
  const { type, sql } = fields[field];
  if (type === "flag") return (op === "not") === Boolean(value) ? `NOT ${sql}` : sql;
  if (type === "list") {
    const item = field === "genre" ? text(String(value)) : int(Number(value));
    const has = `list_contains(${sql}, ${item})`;
    return op === "not" ? `NOT COALESCE(${has}, FALSE)` : has;
  }
  const symbol = { is: "=", not: "<>", gt: ">", lt: "<" }[op];
  return `${sql} ${symbol} ${literal(type, value)}`;
};

const filterNeeds = (filter: Filter): Join[] =>
  (filter.rules ?? []).flatMap((rule) => {
    const { needs } = fields[rule.field];
    return needs ? [needs] : [];
  });

const filterConditions = ({ from, to, rules = [] }: Filter): string[] => [
  ...(from ? [`CAST(i.ts AS DATE) >= ${day(from)}`] : []),
  ...(to ? [`CAST(i.ts AS DATE) <= ${day(to)}`] : []),
  ...rules.map(condition),
];

type FromOptions = {
  needs?: readonly (Join | undefined)[];
  // Extra joins on the play row, such as an unnest.
  joins?: string;
  conditions?: readonly string[];
};

// The FROM clause over plays `i`, joined to what the filter and `needs` read.
export const playsFrom = (
  filter: Filter,
  { needs = [], joins = "", conditions = [] }: FromOptions = {},
): string => {
  const all = new Set([...needs, ...filterNeeds(filter)]);
  return `
    FROM interactions i
    ${all.has("track") || all.has("album") ? "JOIN tracks t ON t.id = i.track_id" : ""}
    ${all.has("album") ? "LEFT JOIN albums al ON al.id = t.album_id" : ""}
    ${joins}
    ${where([...filterConditions(filter), ...conditions])}`;
};

// The global scope of the app (period and picked artist) as a filter.
export const scopeFilter = ({ from, to, artistId }: Scope): Filter & { from: Date; to: Date } => ({
  from,
  to,
  rules: artistId === undefined ? [] : [{ field: "artist", op: "is", value: artistId }],
});
