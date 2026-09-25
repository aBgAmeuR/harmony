import type { PipelineStep } from "@harmony/upload";

import { db } from "@harmony/duckdb";

export type PackageOverview = {
  publicId: string;
  fileName: string;
  fileSize: number;
  status: string;
  createdAt: string;
  startedAt: string;
  totalDurationMs: number;
  steps: PipelineStep[];
};

type PackageMetaRow = {
  public_id: string;
  file_name: string;
  file_size: number;
  status: string;
  created_at: string;
  started_at: string;
  total_duration_ms: number;
  steps: unknown;
};

export const metaFn = async (): Promise<PackageOverview> => {
  const rows = await db.query<PackageMetaRow>(`
    SELECT
      public_id,
      file_name,
      file_size::INTEGER AS file_size,
      status,
      strftime(created_at, '%Y-%m-%dT%H:%M:%SZ') AS created_at,
      strftime(started_at, '%Y-%m-%dT%H:%M:%SZ') AS started_at,
      total_duration_ms::INTEGER AS total_duration_ms,
      steps::VARCHAR AS steps
    FROM package_meta
    LIMIT 1
  `);

  const row = rows[0];
  if (!row) {
    throw new Error("package metadata is missing from the database");
  }

  return {
    publicId: row.public_id,
    fileName: row.file_name,
    fileSize: row.file_size,
    status: row.status,
    createdAt: row.created_at,
    startedAt: row.started_at,
    totalDurationMs: row.total_duration_ms,
    steps: readSteps(row.steps),
  };
};

function readSteps(value: unknown): PipelineStep[] {
  const parsed: unknown = typeof value === "string" ? parseJson(value) : value;
  if (!Array.isArray(parsed)) {
    throw new Error("package metadata steps are missing");
  }
  return parsed as PipelineStep[];
}

function parseJson(value: string): unknown {
  return JSON.parse(value) as unknown;
}
