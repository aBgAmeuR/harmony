import type { PipelineEvent } from "./types";

type StreamHandlers = {
  onEvent: (event: PipelineEvent) => void;
  onError: (message: string) => void;
};

function parsePipelineEvent(data: string): PipelineEvent {
  const parsed: unknown = JSON.parse(data);
  if (typeof parsed !== "object" || parsed === null || !("type" in parsed)) {
    throw new Error("Invalid pipeline event payload");
  }
  return parsed as PipelineEvent;
}

export function connectPipelineStream(streamUrl: string, handlers: StreamHandlers): () => void {
  const source = new EventSource(streamUrl);

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
    handlers.onError("Pipeline stream disconnected");
  };

  return () => {
    source.removeEventListener("pipeline", handleMessage);
    source.removeEventListener("message", handleMessage);
    source.close();
  };
}
