import { createFileRoute } from "@tanstack/react-router";

import { UploadPage } from "@/pages/upload/page";

export const Route = createFileRoute("/upload")({
  component: UploadPage,
});
