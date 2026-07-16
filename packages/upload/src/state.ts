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
    seq: 0,
    steps: STEP_ORDER.map((id) => ({
      id,
      label: STEP_LABELS[id],
      status: "pending",
    })),
  };
}

export const INITIAL_PIPELINE_STATE: PipelineState = createInitialPipelineState();

function updateStep(
  steps: PipelineStep[],
  stepId: StepId,
  patch: Partial<PipelineStep>,
): PipelineStep[] {
  return steps.map((step) => (step.id === stepId ? { ...step, ...patch } : step));
}

export function reducePipelineEvent(state: PipelineState, event: PipelineEvent): PipelineState {
  if (event.seq <= state.seq) {
    return state;
  }

  switch (event.type) {
    case "snapshot":
      return {
        ...state,
        seq: event.seq,
        steps: event.steps,
        runStatus: event.runStatus,
        startedAt: event.startedAt ?? state.startedAt,
        endedAt: event.endedAt ?? state.endedAt,
      };

    case "step.started":
      return {
        ...state,
        seq: event.seq,
        runStatus: "running",
        startedAt: state.startedAt ?? event.at,
        steps: updateStep(state.steps, event.stepId, {
          status: "running",
          label: event.label,
          startedAt: event.at,
        }),
      };

    case "step.progress":
      return {
        ...state,
        seq: event.seq,
        steps: updateStep(state.steps, event.stepId, {
          progress: event.progress,
        }),
      };

    case "step.completed":
      return {
        ...state,
        seq: event.seq,
        steps: updateStep(state.steps, event.stepId, {
          status: "done",
          endedAt: event.at,
          output: event.output,
          progress: undefined,
        }),
      };

    case "step.failed":
      return {
        ...state,
        seq: event.seq,
        runStatus: "error",
        error: event.error,
        endedAt: event.at,
        steps: updateStep(state.steps, event.stepId, {
          status: "error",
          endedAt: event.at,
          error: event.error,
        }),
      };

    case "run.completed":
      return {
        ...state,
        seq: event.seq,
        runStatus: "done",
        endedAt: event.at,
      };

    case "run.failed":
      return {
        ...state,
        seq: event.seq,
        runStatus: "error",
        error: event.error,
        endedAt: event.at,
      };

    default: {
      const _exhaustive: never = event;
      return _exhaustive;
    }
  }
}
