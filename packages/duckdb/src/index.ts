import type { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";

import { DuckDBNotInitializedError } from "./error";
import { useDbStore } from "./store";

export {
  DuckDBError,
  DuckDBEnvironmentError,
  DuckDBFetchError,
  DuckDBNotInitializedError,
  DuckDBPackageNotFoundError,
} from "./error";
export { prefetchDuckDB } from "./duckdb";

type TimedQueryResult<T> = {
  rows: T[];
  queryMs: number;
  toArrayMs: number;
};

async function executeTimedQuery<T>(
  conn: AsyncDuckDBConnection,
  query: string,
): Promise<TimedQueryResult<T>> {
  const start = performance.now();
  const result = await conn.query(query);
  const queryMs = performance.now() - start;

  const startToArray = performance.now();
  const rows = result.toArray() as T[];
  const toArrayMs = performance.now() - startToArray;

  return { rows, queryMs, toArrayMs };
}

function getConnection(): AsyncDuckDBConnection {
  const conn = useDbStore.getState().conn;
  if (!conn) {
    throw new DuckDBNotInitializedError();
  }
  return conn;
}

export const db = {
  async init(packageId: string, url: string) {
    return await useDbStore.getState().initialize(packageId, url);
  },
  async query<T>(query: string): Promise<T[]> {
    const { rows, queryMs, toArrayMs } = await executeTimedQuery<T>(getConnection(), query);
    if (import.meta.env.DEV) {
      console.log({
        durationToArrayMs: toArrayMs.toFixed(2) + "ms",
        durationMs: queryMs.toFixed(2) + "ms",
        query,
      });
    }
    return rows;
  },
  status: () => useDbStore.getState().status,
  error: () => useDbStore.getState().error,
};
