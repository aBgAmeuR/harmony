import type { PipelineEvent, PipelineState } from "./types";

import { streamUrl } from "./client";
import { INITIAL_PIPELINE_STATE, reducePipelineEvent } from "./state";
import { connectPipelineStream } from "./stream";

// What the UI shows of a run. A new object on every change, so React sees each one.
export type PipelineSnapshot = { state: PipelineState; connectionError: string | null };

export const INITIAL_SNAPSHOT: PipelineSnapshot = {
  state: INITIAL_PIPELINE_STATE,
  connectionError: null,
};

// The live progress of one package, fed by the server's event stream.
export const createPipeline = (publicId: string) => {
  const listeners = new Set<() => void>();
  let snapshot = INITIAL_SNAPSHOT;
  let disconnect: (() => void) | null = null;

  const set = (next: PipelineSnapshot) => {
    snapshot = next;
    for (const listener of listeners) listener();
  };

  const finished = () =>
    snapshot.state.runStatus === "done" || snapshot.state.runStatus === "error";

  const onEvent = (event: PipelineEvent) => {
    const state = reducePipelineEvent(snapshot.state, event);
    // Any event means the stream is back, even a repeat of the last snapshot.
    if (state !== snapshot.state || snapshot.connectionError !== null) {
      set({ state, connectionError: null });
    }
    if (finished()) stop();
  };

  const onError = (message: string) => {
    if (finished() || snapshot.connectionError === message) return;
    set({ ...snapshot, connectionError: message });
  };

  const stop = () => {
    disconnect?.();
    disconnect = null;
  };

  return {
    publicId,
    connect: () => {
      disconnect ??= connectPipelineStream(streamUrl(publicId), { onEvent, onError });
    },
    disconnect: stop,
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};

export type Pipeline = ReturnType<typeof createPipeline>;
