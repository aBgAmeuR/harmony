import type { PipelineEvent } from "./types";

import { parsePipelineSnapshot } from "./parse";

type StreamHandlers = {
  onEvent: (event: PipelineEvent) => void;
  onError: (message: string) => void;
};

function parsePipelineEvent(data: string): PipelineEvent {
  return parsePipelineSnapshot(readJson(data));
}

function readJson(data: string): unknown {
  return JSON.parse(data) as unknown;
}

export function connectPipelineStream(streamUrl: string, handlers: StreamHandlers): () => void {
  const source = new EventSource(streamUrl);
  let closed = false;

  const handleMessage = (event: MessageEvent<string>) => {
    try {
      handlers.onEvent(parsePipelineEvent(event.data));
    } catch {
      handlers.onError("Invalid pipeline event");
    }
  };

  source.addEventListener("pipeline", handleMessage);
  source.addEventListener("message", handleMessage);
  source.onerror = () => {
    if (closed) {
      return;
    }
    handlers.onError("Pipeline stream disconnected");
  };

  return () => {
    closed = true;
    source.removeEventListener("pipeline", handleMessage);
    source.removeEventListener("message", handleMessage);
    source.close();
  };
}
