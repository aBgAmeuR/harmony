import { UploadClient } from "@harmony/upload";

export const upload = new UploadClient({
  baseUrl: import.meta.env.VITE_API_URL,
});
