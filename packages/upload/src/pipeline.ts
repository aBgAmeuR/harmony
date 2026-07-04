import { connectPipelineStream } from "./stream";
import {
  createInitialPipelineState,
  reducePipelineEvent,
} from "./state";
import type { UploadClient } from "./client";
import type { PipelineEvent, PipelineState } from "./types";

export class Pipeline {
  private readonly listeners = new Set<() => void>();
  private state: PipelineState = createInitialPipelineState();
  private connectionError: string | null = null;
  private disconnectStream: (() => void) | null = null;
  private connected = false;

  constructor(
    private readonly client: UploadClient,
    readonly publicId: string,
  ) {}

  connect(): this {
    if (this.connected) {
      return this;
    }

    this.connected = true;
    this.connectionError = null;

    const streamUrl = this.client.streamUrl(this.publicId);
    this.disconnectStream = connectPipelineStream(streamUrl, {
      onEvent: (event) => this.handleEvent(event),
      onError: (message) => this.handleConnectionError(message),
    });

    return this;
  }

  disconnect(): void {
    this.disconnectStream?.();
    this.disconnectStream = null;
    this.connected = false;
  }

  getState(): Readonly<PipelineState> {
    return this.state;
  }

  getConnectionError(): string | null {
    return this.connectionError;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private handleEvent(event: PipelineEvent): void {
    const nextState = reducePipelineEvent(this.state, event);
    if (nextState === this.state) {
      return;
    }

    this.state = nextState;
    this.emit();

    if (nextState.runStatus === "done" || nextState.runStatus === "error") {
      this.disconnect();
    }
  }

  private handleConnectionError(message: string): void {
    if (this.connectionError === message) {
      return;
    }
    this.connectionError = message;
    this.emit();
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}
