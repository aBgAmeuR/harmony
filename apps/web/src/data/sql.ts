import { isoDay } from "@/shared/lib/date";

// Literals for the SQL strings sent to DuckDB, which takes no bound parameters.
export const day = (date: Date): string => `DATE '${isoDay(date)}'`;

export const text = (value: string): string => `'${value.replaceAll("'", "''")}'`;

// A value from a URL may not be a number: NULL matches nothing.
export const int = (value: number): string =>
  Number.isFinite(value) ? String(Math.trunc(value)) : "NULL";

export const num = (value: number): string => (Number.isFinite(value) ? String(value) : "0");

// A `LIKE` pattern that finds `term` anywhere: its own wildcards lose their meaning.
export const containing = (term: string): string =>
  `${text(`%${term.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_")}%`)} ESCAPE '\\'`;

// The large picture when the catalog has one, the thumbnail otherwise.
export const picture = (table: string): string =>
  `COALESCE(NULLIF(${table}.image_uri, ''), ${table}.image)`;

export const where = (conditions: readonly string[]): string =>
  conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
