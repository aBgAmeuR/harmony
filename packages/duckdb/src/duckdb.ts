import type { AsyncDuckDB, DuckDBBundles } from "@duckdb/duckdb-wasm";

import eh_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url";
import mvp_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url";
import duckdb_wasm_eh from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url";
import duckdb_wasm from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url";

import { DuckDBEnvironmentError, DuckDBFetchError, DuckDBPackageNotFoundError } from "./error";

const MANUAL_BUNDLES: DuckDBBundles = {
  mvp: {
    mainModule: duckdb_wasm,
    mainWorker: mvp_worker,
  },
  eh: {
    mainModule: duckdb_wasm_eh,
    mainWorker: eh_worker,
  },
};

let dbInstance: AsyncDuckDB | null = null;
let initPromise: Promise<AsyncDuckDB> | null = null;

export const getDuckDBInstance = async () => {
  if (typeof window === "undefined") {
    throw new DuckDBEnvironmentError();
  }

  if (dbInstance) return dbInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // Loaded lazily: the server must never evaluate the package (its Node entry throws on import).
    const duckdb = await import("@duckdb/duckdb-wasm");
    const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);

    const worker = new Worker(bundle.mainWorker!);
    const logger = new duckdb.VoidLogger();
    const db = new duckdb.AsyncDuckDB(logger, worker);

    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

    dbInstance = db;
    return db;
  })();

  return initPromise;
};

type SaveDataNavigator = Navigator & { connection?: { saveData?: boolean } };

export const prefetchDuckDB = async () => {
  if (typeof document === "undefined") return;
  if ((navigator as SaveDataNavigator).connection?.saveData) return;

  const duckdb = await import("@duckdb/duckdb-wasm");
  const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
  for (const href of [bundle.mainWorker, bundle.mainModule]) {
    if (!href || document.querySelector(`link[rel="prefetch"][href="${href}"]`)) continue;
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = href;
    document.head.append(link);
  }
};

export async function fetchPackageDatabase(packageId: string, url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) {
      throw new DuckDBPackageNotFoundError(packageId);
    }
    throw new DuckDBFetchError(packageId, response.status);
  }

  return new Uint8Array(await response.arrayBuffer());
}
