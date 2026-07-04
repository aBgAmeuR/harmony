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
    console.log({ durationMs: durationMs.toFixed(2) + "ms", query });

    return result.toArray() as T[];
  },
  status: () => useDbStore.getState().status,
  error: () => useDbStore.getState().error,
};
