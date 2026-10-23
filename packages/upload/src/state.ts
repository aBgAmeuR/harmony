import type { PipelineEvent, PipelineState, PipelineStep, StepId } from "./types";

export const STEP_ORDER: StepId[] = [
  "extract_archive",
  "parse_interactions",
  "normalize_interactions",
  "resolve_tracks",
  "enrich_tracks",
  "enrich_albums",
  "persist_interactions",
];

export const STEP_LABELS: Record<StepId, string> = {
  extract_archive: "Extract archive",
  parse_interactions: "Parse interactions",
  normalize_interactions: "Normalize interactions",
  resolve_tracks: "Resolve tracks",
  enrich_tracks: "Enrich tracks",
  enrich_albums: "Enrich albums",
  persist_interactions: "Save interactions",
};

export function createInitialPipelineState(): PipelineState {
  return {
    runStatus: "idle",
    seq: -1,
    steps: STEP_ORDER.map((id) => ({
      id,
      label: STEP_LABELS[id],
      status: "pending",
    })),
  };
}

export const INITIAL_PIPELINE_STATE: PipelineState = createInitialPipelineState();

export function reducePipelineEvent(state: PipelineState, event: PipelineEvent): PipelineState {
  if (event.seq <= state.seq) {
    return state;
  }

  return {
    runStatus: event.runStatus,
    seq: event.seq,
    steps: event.steps,
    startedAt: event.startedAt,
    endedAt: event.endedAt,
    stats: event.stats,
    error: runError(event),
  };
}

function runError(event: PipelineEvent): string | undefined {
  if (event.runStatus !== "error") {
    return undefined;
  }
  return failedStepMessage(event.steps) ?? "Pipeline failed";
}

function failedStepMessage(steps: PipelineStep[]): string | undefined {
  return steps.find((step) => step.status === "error")?.error;
}
