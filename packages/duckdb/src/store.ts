import type { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";

import { create } from "zustand";

import { getDuckDBInstance, registerPackageDatabase } from "./duckdb";
import { DuckDBError } from "./error";

type DbStatus = "idle" | "loading" | "ready" | "error";

type DbStore = {
  conn: AsyncDuckDBConnection | null;
  status: DbStatus;
  error: DuckDBError | null;
  initialize: (packageId: string, url: string) => Promise<void>;
};

let initPromise: Promise<void> | null = null;

export const useDbStore = create<DbStore>()((set, get) => ({
  conn: null,
  status: "idle",
  error: null,
  initialize: async (packageId: string, url: string) => {
    const { status } = get();
    if (status === "ready" || status === "error") return;
    if (initPromise) return initPromise;

    initPromise = (async () => {
      set({ status: "loading", error: null });

      try {
        const db = await getDuckDBInstance();
        const fileName = await registerPackageDatabase(db, packageId, url);
        const conn = await db.connect();

        await conn.query(`ATTACH '${fileName}' AS pkg (READ_ONLY)`);
        await conn.query(`USE pkg`);

        set({ conn, status: "ready" });
      } catch (err) {
        const error = err instanceof DuckDBError ? err : new DuckDBError(String(err));
        set({ conn: null, status: "error", error });
        initPromise = null;
        throw error;
      }
    })();

    return initPromise;
  },
}));
