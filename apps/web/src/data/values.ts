import { db } from "@harmony/duckdb";

import { platformLabel } from "@/shared/lib/format";

import { listFn, type BaseId } from "./bases";
import { fields, playsFrom, type FieldId, type Filter } from "./filter";

export type Value = { value: string | number; label: string; image: string | null };

const LISTED: Partial<Record<FieldId, BaseId>> = {
  artist: "artists",
  albumArtist: "artists",
  album: "albums",
  track: "tracks",
  genre: "genres",
};

export const valuesFn = async ({
  field,
  search = "",
  filter,
}: {
  field: FieldId;
  search?: string;
  filter: Filter;
}) => {
  const base = LISTED[field];
  if (base) {
    const { rows } = await listFn({
      base,
      filter,
      search,
      sort: "playtime",
      desc: true,
      limit: 25,
    });
    return rows.map((row) => ({ value: row.id, label: row.name, image: row.image }));
  }
  const { type, sql, needs } = fields[field];
  if (type !== "text") return [];
  const rows = await db.query<{ value: string }>(`
    SELECT ${sql} AS value
    ${playsFrom(filter, { needs: [needs], conditions: [`${sql} IS NOT NULL`] })}
    GROUP BY 1
    ORDER BY COUNT(*) DESC`);
  return rows.map(({ value }) => ({
    value,
    label: field === "platform" ? platformLabel(value) : value,
    image: null,
  }));
};
