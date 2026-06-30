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
  phase?: string;
  current: number;
  total: number;
  failed?: number;
};

export type PipelineStep = {
  id: StepId;
  label: string;
  status: StepStatus;
  startedAt?: string;
  endedAt?: string;
  error?: string;
  progress?: StepProgress;
  output?: Record<string, unknown>;
};

export type PipelineRunStatus = "idle" | "running" | "done" | "error";

export type PipelineState = {
  runStatus: PipelineRunStatus;
  steps: PipelineStep[];
  seq: number;
  startedAt?: string;
  endedAt?: string;
  error?: string;
};

export type PipelineEvent =
  | {
      type: "snapshot";
      seq: number;
      steps: PipelineStep[];
      runStatus: PipelineRunStatus;
      startedAt?: string;
      endedAt?: string;
    }
  | {
      type: "step.started";
      seq: number;
      stepId: StepId;
      label: string;
      at: string;
    }
  | {
      type: "step.progress";
      seq: number;
      stepId: StepId;
      progress: StepProgress;
    }
  | {
      type: "step.completed";
      seq: number;
      stepId: StepId;
      at: string;
      durationMs: number;
      output?: Record<string, unknown>;
    }
  | {
      type: "step.failed";
      seq: number;
      stepId: StepId;
      at: string;
      error: string;
    }
  | {
      type: "run.completed";
      seq: number;
      at: string;
      stats: Record<string, unknown>;
    }
  | {
      type: "run.failed";
      seq: number;
      stepId: StepId;
      at: string;
      error: string;
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
