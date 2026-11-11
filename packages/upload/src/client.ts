import type { DeployInput, DeployResult, ServerConfig } from "./types";

import { UploadError } from "./errors";

// The API is served from the same origin as the app (Vite proxies it in development).
export const deploy = async ({ file, selectedFiles }: DeployInput): Promise<DeployResult> => {
  const form = new FormData();
  form.append("file", file);
  if (selectedFiles.length > 0) {
    form.append("selected_files", JSON.stringify(selectedFiles));
  }

  const response = await fetch("/api/v1/packages", { method: "POST", body: form });
  if (!response.ok) {
    throw new UploadError((await response.text()) || "Upload failed", response.status);
  }
  const body = (await response.json()) as { public_id: string };
  return { publicId: body.public_id };
};

export const serverConfig = async (): Promise<ServerConfig> => {
  const response = await fetch("/api/v1/config");
  if (!response.ok) throw new UploadError("Failed to load server config", response.status);
  const body = (await response.json()) as { max_upload_bytes: number };
  return { maxUploadBytes: body.max_upload_bytes };
};

export const streamUrl = (publicId: string): string =>
  `/api/v1/packages/${encodeURIComponent(publicId)}/stream`;
