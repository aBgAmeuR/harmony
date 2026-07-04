import type { DeployInput, DeployResult, UploadConfig, UploadResponseBody } from "./types";

import { UploadError } from "./errors";
import { Pipeline } from "./pipeline";

export class UploadClient {
  constructor(private readonly config: UploadConfig) {}

  async deploy(input: DeployInput): Promise<DeployResult> {
    const formData = new FormData();
    formData.append("file", input.file);

    if (input.selectedFiles.length > 0) {
      const normalized = input.selectedFiles.map((path) => path.replace(/\\/g, "/"));
      formData.append("selected_files", JSON.stringify(normalized));
    }

    const response = await fetch(this.url("/api/v1/packages"), {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const message = await response.text().catch(() => "Upload failed");
      throw new UploadError(message || "Upload failed", response.status);
    }

    const body = (await response.json()) as UploadResponseBody;
    return { publicId: body.public_id };
  }

  pipeline(publicId: string): Pipeline {
    return new Pipeline(this, publicId);
  }

  streamUrl(publicId: string): string {
    return this.url(`/api/v1/packages/${encodeURIComponent(publicId)}/stream`);
  }

  private url(path: string): string {
    const baseUrl = this.config.baseUrl.replace(/\/$/, "");
    return `${baseUrl}${path}`;
  }
}
