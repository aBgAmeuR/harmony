import { useSyncExternalStore } from "react";

import type { Pipeline } from "../pipeline";

import { INITIAL_PIPELINE_STATE } from "../state";

export function usePipeline(pipeline: Pipeline | null) {
  const state = useSyncExternalStore(
    (onStoreChange) => pipeline?.subscribe(onStoreChange) ?? (() => {}),
    () => pipeline?.getState() ?? INITIAL_PIPELINE_STATE,
    () => INITIAL_PIPELINE_STATE,
  );

  const connectionError = pipeline?.getConnectionError() ?? null;

  return {
    state,
    connectionError,
    isRunning: state.runStatus === "running",
    isDone: state.runStatus === "done",
    isFailed: state.runStatus === "error",
  };
}
