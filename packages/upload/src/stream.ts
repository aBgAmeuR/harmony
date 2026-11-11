import type { PipelineEvent } from "./types";

import { parsePipelineSnapshot } from "./parse";

type StreamHandlers = {
  onEvent: (event: PipelineEvent) => void;
  onError: (message: string) => void;
};

// The server sends `pipeline` events, each one a full snapshot of the run.
export const connectPipelineStream = (url: string, handlers: StreamHandlers): (() => void) => {
  const source = new EventSource(url);
  let closed = false;

  const onMessage = (event: MessageEvent<string>) => {
    let parsed: PipelineEvent;
    try {
      parsed = parsePipelineSnapshot(JSON.parse(event.data));
    } catch (error) {
      handlers.onError(`Invalid pipeline event: ${String(error)}`);
      return;
    }
    handlers.onEvent(parsed);
  };

  source.addEventListener("pipeline", onMessage);
  source.onerror = () => {
    if (!closed) handlers.onError("Pipeline stream disconnected");
  };

  return () => {
    closed = true;
    source.removeEventListener("pipeline", onMessage);
    source.close();
  };
};
