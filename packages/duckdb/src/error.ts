export class DuckDBError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuckDBError";
  }
}

export class DuckDBNotInitializedError extends DuckDBError {
  constructor() {
    super("Database not initialized");
    this.name = "DuckDBNotInitializedError";
  }
}

export class DuckDBEnvironmentError extends DuckDBError {
  constructor() {
    super("DuckDB WASM is only available in the browser");
    this.name = "DuckDBEnvironmentError";
  }
}

export class DuckDBPackageNotFoundError extends DuckDBError {
  readonly packageId: string;

  constructor(packageId: string) {
    super(`Package not found: ${packageId}`);
    this.name = "DuckDBPackageNotFoundError";
    this.packageId = packageId;
  }
}

export class DuckDBFetchError extends DuckDBError {
  readonly packageId: string;
  readonly status: number;

  constructor(packageId: string, status: number) {
    super(`Failed to fetch package data: ${status}`);
    this.name = "DuckDBFetchError";
    this.packageId = packageId;
    this.status = status;
  }
}
