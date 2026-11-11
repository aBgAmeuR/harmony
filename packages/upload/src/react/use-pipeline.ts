import { useSyncExternalStore } from "react";

import { INITIAL_SNAPSHOT, type Pipeline, type PipelineSnapshot } from "../pipeline";

const NONE = () => () => {};

export const usePipeline = (pipeline: Pipeline | null): PipelineSnapshot =>
  useSyncExternalStore(
    pipeline?.subscribe ?? NONE,
    () => pipeline?.getSnapshot() ?? INITIAL_SNAPSHOT,
    () => INITIAL_SNAPSHOT,
  );
