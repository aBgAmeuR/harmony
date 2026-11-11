import type { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";

import { fetchPackageDatabase, getDuckDBInstance } from "./duckdb";
import { DuckDBError, DuckDBNotInitializedError, DuckDBPackageNotFoundError } from "./error";

export { DuckDBError, DuckDBFetchError, DuckDBPackageNotFoundError } from "./error";
export { prefetchDuckDB } from "./duckdb";

// Public ids are short alphanumeric strings; anything else would be spliced into SQL below.
const PACKAGE_ID = /^[A-Za-z0-9]+$/;

// One package is open at a time, on one connection to the in-browser engine.
let conn: AsyncDuckDBConnection | null = null;
let opened: { packageId: string; ready: Promise<boolean> } | null = null;
// The package queries read, which a failed open leaves in place.
let attached: string | null = null;

const fileOf = (packageId: string) => `${packageId}.duckdb`;

const use = async (connection: AsyncDuckDBConnection, packageId: string) => {
  await connection.query(`USE memory`);
  await connection.query(`DETACH DATABASE IF EXISTS pkg`);
  await connection.query(`ATTACH '${fileOf(packageId)}' AS pkg (READ_ONLY)`);
  await connection.query(`USE pkg`);
};

// Resolves to true when it replaced another package.
const attach = async (packageId: string): Promise<boolean> => {
  const [engine, buffer] = await Promise.all([
    getDuckDBInstance(),
    // The API route `/files/{name}` serves the file under the same name.
    fetchPackageDatabase(packageId, `/files/${fileOf(packageId)}`),
  ]);
  await engine.registerFileBuffer(fileOf(packageId), buffer);
  const connection = (conn ??= await engine.connect());
  const previous = attached;
  try {
    await use(connection, packageId);
  } catch (error) {
    if (previous) await use(connection, previous);
    await engine.dropFile(fileOf(packageId));
    throw error;
  }
  attached = packageId;
  if (previous && previous !== packageId) await engine.dropFile(fileOf(previous));
  return previous !== null && previous !== packageId;
};

export const db = {
  // Downloads the package file from the API and makes it the database every query reads.
  // Resolves to true when it replaced another package, whose cached results are then stale.
  open: (packageId: string): Promise<boolean> => {
    if (opened?.packageId === packageId) return opened.ready;
    if (!PACKAGE_ID.test(packageId))
      return Promise.reject(new DuckDBPackageNotFoundError(packageId));

    const previous = opened;
    const ready = (async () => {
      await previous?.ready.catch(() => undefined);
      try {
        return await attach(packageId);
      } catch (error) {
        if (opened?.packageId === packageId) opened = null;
        throw error instanceof DuckDBError ? error : new DuckDBError(String(error));
      }
    })();
    opened = { packageId, ready };
    return ready;
  },

  // Rows as plain objects. Callers cast BIGINT columns to INTEGER or DOUBLE in SQL, since Arrow
  // returns them as BigInt.
  query: async <T>(sql: string): Promise<T[]> => {
    if (!conn) throw new DuckDBNotInitializedError();
    const start = performance.now();
    const rows = (await conn.query(sql)).toArray() as T[];
    if (import.meta.env.DEV) console.debug(`${(performance.now() - start).toFixed(1)} ms`, sql);
    return rows;
  },
};
