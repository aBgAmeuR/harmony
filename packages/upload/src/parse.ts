import type {
  PipelineEvent,
  PipelineRunStatus,
  PipelineStats,
  PipelineStep,
  StepId,
  StepOutput,
  StepProgress,
  StepStatus,
} from "./types";

import { STEP_ORDER } from "./state";

const STEP_IDS = new Set<string>(STEP_ORDER);

const STEP_STATUSES = new Set<string>(["pending", "running", "done", "error"]);
const RUN_STATUSES = new Set<string>(["idle", "running", "done", "error"]);

export function parsePipelineSnapshot(value: unknown): PipelineEvent {
  const record = asRecord(value);
  if (record.type !== "snapshot") {
    throw new Error("Invalid pipeline event payload");
  }

  const seq = readNumber(record.seq);
  if (seq === undefined || !isRunStatus(record.runStatus) || !Array.isArray(record.steps)) {
    throw new Error("Invalid pipeline event payload");
  }

  return {
    type: "snapshot",
    seq,
    runStatus: record.runStatus,
    steps: record.steps.map(parseStep),
    startedAt: readOptionalString(record.startedAt),
    endedAt: readOptionalString(record.endedAt),
    stats: parseStats(record.stats),
  };
}

export function parsePipelineSteps(value: unknown): PipelineStep[] {
  if (Array.isArray(value)) {
    return value.map(parseStep);
  }
  if (!isRecord(value) || !Array.isArray(value.steps)) {
    throw new Error("package metadata steps are missing");
  }
  return value.steps.map(parseStep);
}

function parseStep(value: unknown): PipelineStep {
  const record = asRecord(value);
  if (!isStepId(record.id) || typeof record.label !== "string" || !isStepStatus(record.status)) {
    throw new Error("Invalid pipeline step");
  }

  return {
    id: record.id,
    label: record.label,
    status: record.status,
    startedAt: readOptionalString(record.startedAt),
    endedAt: readOptionalString(record.endedAt),
    error: readOptionalString(record.error),
    progress: parseProgress(record.progress),
    output: parseOutput(record.output),
  };
}

function parseProgress(value: unknown): StepProgress | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  const record = asRecord(value);
  const current = readNumber(record.current);
  const total = readNumber(record.total);
  const failed = readNumber(record.failed);
  if (current === undefined || total === undefined || failed === undefined) {
    throw new Error("Invalid pipeline step progress");
  }
  return { current, total, failed };
}

function parseOutput(value: unknown): StepOutput | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  const record = asRecord(value);
  const read = readNumber(record.read);
  const keep = readNumber(record.keep);
  const drop = readNumber(record.drop);
  if (read === undefined || keep === undefined || drop === undefined) {
    throw new Error("Invalid pipeline step output");
  }
  return { read, keep, drop };
}

function parseStats(value: unknown): PipelineStats | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  const record = asRecord(value);
  const calls = readNumber(record.calls);
  const retries = readNumber(record.retries);
  const misses = readNumber(record.misses);
  const ms = readNumber(record.ms);
  if (calls === undefined || retries === undefined || misses === undefined || ms === undefined) {
    throw new Error("Invalid pipeline stats");
  }
  return { calls, retries, misses, ms };
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error("Invalid pipeline event payload");
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readNumber(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }
  return value;
}

function readOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new Error("Invalid pipeline event payload");
  }
  return value;
}

function isStepId(value: unknown): value is StepId {
  return typeof value === "string" && STEP_IDS.has(value);
}

function isStepStatus(value: unknown): value is StepStatus {
  return typeof value === "string" && STEP_STATUSES.has(value);
}

function isRunStatus(value: unknown): value is PipelineRunStatus {
  return typeof value === "string" && RUN_STATUSES.has(value);
}
