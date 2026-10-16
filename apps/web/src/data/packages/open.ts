import { db, DuckDBFetchError, DuckDBPackageNotFoundError } from "@harmony/duckdb";

export type OpenErrorKind = "missing" | "fetch" | "other";

export const openFn = (packageId: string) => db.init(packageId, `/files/${packageId}.duckdb`);

export const openErrorFn = (error: unknown): Error => {
  if (error instanceof Error) return error;
  return db.error() ?? new Error(String(error));
};

export const openErrorKind = (error: Error): OpenErrorKind => {
  if (error instanceof DuckDBPackageNotFoundError) return "missing";
  if (error instanceof DuckDBFetchError) return "fetch";
  return "other";
};
