import { UploadClient } from "@harmony/upload";

export function createUploadClient(baseUrl: string) {
  return new UploadClient({ baseUrl });
}
