import * as duckdb from "@duckdb/duckdb-wasm";

import {
  DuckDBEnvironmentError,
  DuckDBFetchError,
  DuckDBPackageNotFoundError,
} from "./error";
import eh_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url";
import mvp_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url";
import duckdb_wasm_eh from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url";
import duckdb_wasm from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url";

const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
  mvp: {
    mainModule: duckdb_wasm,
    mainWorker: mvp_worker,
  },
  eh: {
    mainModule: duckdb_wasm_eh,
    mainWorker: eh_worker,
  },
};

let dbInstance: duckdb.AsyncDuckDB | null = null;
let initPromise: Promise<duckdb.AsyncDuckDB> | null = null;

export const getDuckDBInstance = async () => {
  if (typeof window === "undefined") {
    throw new DuckDBEnvironmentError();
  }

  if (dbInstance) return dbInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);

    const worker = new Worker(bundle.mainWorker!);
    const logger = new duckdb.ConsoleLogger();
    const db = new duckdb.AsyncDuckDB(logger, worker);

    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

    dbInstance = db;
    return db;
  })();

  return initPromise;
};

export async function registerPackageDatabase(
  dbInstance: duckdb.AsyncDuckDB,
  packageId: string,
  url: string,
) {
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) {
      throw new DuckDBPackageNotFoundError(packageId);
    }
    throw new DuckDBFetchError(packageId, response.status);
  }

  const buffer = new Uint8Array(await response.arrayBuffer());
  const fileName = `${packageId}.duckdb`;

  await dbInstance.registerFileBuffer(fileName, buffer);

  return fileName;
}
