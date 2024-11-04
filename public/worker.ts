import { filesProcessing } from "@/services/file-processing";

addEventListener("message", async (event) => {
  const { file } = event.data;
  const res = await filesProcessing(file);
  postMessage(res);
});