import { db, DuckDBFetchError, DuckDBPackageNotFoundError, prefetchDuckDB } from "@harmony/duckdb";

export type OpenErrorKind = "missing" | "fetch" | "other";

export const openFn = (packageId: string) => db.open(packageId);

// A hint to the browser to fetch the engine early: if it fails, opening a package fetches it.
export const prefetchEngine = () => void prefetchDuckDB().catch(() => undefined);

export const openErrorKind = (error: unknown): OpenErrorKind => {
  if (error instanceof DuckDBPackageNotFoundError) return "missing";
  if (error instanceof DuckDBFetchError) return "fetch";
  return "other";
};
