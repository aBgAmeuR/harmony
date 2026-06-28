import type { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";

import { create } from "zustand";

import { getDuckDBInstance, registerPackageDatabase } from "./duckdb";

type DbStatus = "idle" | "loading" | "ready" | "error";

type DbStore = {
  conn: AsyncDuckDBConnection | null;
  status: DbStatus;
  error: Error | null;
  initialize: (packageId: string) => Promise<void>;
};

let initPromise: Promise<void> | null = null;

export const useDbStore = create<DbStore>()((set, get) => ({
  conn: null,
  status: "idle",
  error: null,
  initialize: async (packageId: string) => {
    console.log("initialize db", packageId);

    const { status } = get();
    if (status === "ready" || status === "error") return;
    if (initPromise) return initPromise;

    initPromise = (async () => {
      set({ status: "loading", error: null });

      try {
        const db = await getDuckDBInstance();
        const fileName = await registerPackageDatabase(
          db,
          packageId,
          `http://localhost:3000/api/v1/packages/${packageId}/db`,
        );
        const conn = await db.connect();

        await conn.query(`ATTACH '${fileName}' AS pkg (READ_ONLY)`);
        await conn.query(`USE pkg`);

        set({ conn, status: "ready" });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error("Error loading package database", err);
        set({ conn: null, status: "error", error });
        initPromise = null;
        throw error;
      }
    })();

    return initPromise;
  },
}));
