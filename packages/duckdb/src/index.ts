import { DuckDBNotInitializedError } from "./error";
import { useDbStore } from "./store";

export {
  DuckDBError,
  DuckDBEnvironmentError,
  DuckDBFetchError,
  DuckDBNotInitializedError,
  DuckDBPackageNotFoundError,
} from "./error";

export const db = {
  async init(packageId: string) {
    return await useDbStore.getState().initialize(packageId);
  },
  async query<T>(query: string): Promise<T[]> {
    const conn = useDbStore.getState().conn;
    if (!conn) {
      throw new DuckDBNotInitializedError();
    }

    const start = performance.now();
    const result = await conn.query(query);
    const durationMs = performance.now() - start;

    const startToArray = performance.now();
    const array = result.toArray() as T[];
    const durationToArrayMs = performance.now() - startToArray;
    console.log({
      durationToArrayMs: durationToArrayMs.toFixed(2) + "ms",
      durationMs: durationMs.toFixed(2) + "ms",
      query,
    });
    return array;
  },
  status: () => useDbStore.getState().status,
  error: () => useDbStore.getState().error,
};
