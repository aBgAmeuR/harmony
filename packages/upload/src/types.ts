export type StepStatus = "pending" | "running" | "done" | "error";

export type StepId =
  | "extract_archive"
  | "parse_interactions"
  | "normalize_interactions"
  | "resolve_tracks"
  | "enrich_tracks"
  | "enrich_albums"
  | "persist_interactions";

export type StepProgress = {
  current: number;
  total: number;
  failed: number;
};

export type StepOutput = {
  read: number;
  keep: number;
  drop: number;
};

export type PipelineStep = {
  id: StepId;
  label: string;
  status: StepStatus;
  startedAt?: string;
  endedAt?: string;
  error?: string;
  progress?: StepProgress;
  output?: StepOutput;
};

export type PipelineRunStatus = "idle" | "running" | "done" | "error";

export type PipelineStats = {
  calls: number;
  retries: number;
  misses: number;
  ms: number;
};

export type PipelineState = {
  runStatus: PipelineRunStatus;
  steps: PipelineStep[];
  seq: number;
  startedAt?: string;
  endedAt?: string;
  error?: string;
  stats?: PipelineStats;
};

/** One SSE payload. The server sends the whole snapshot, at most once a second. */
export type PipelineEvent = {
  type: "snapshot";
  seq: number;
  steps: PipelineStep[];
  runStatus: PipelineRunStatus;
  startedAt?: string;
  endedAt?: string;
  stats?: PipelineStats;
};

export type UploadConfig = {
  baseUrl: string;
};

export type DeployInput = {
  file: File;
  selectedFiles: string[];
};

export type DeployResult = {
  publicId: string;
};

export type UploadResponseBody = {
  public_id: string;
  status: string;
};

export type ServerConfigBody = {
  max_upload_bytes: number;
};

export type ServerConfig = {
  maxUploadBytes: number;
};
