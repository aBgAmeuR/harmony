import { createFileRoute } from "@tanstack/react-router";

import {
  Upload,
  UploadDeployStep,
  UploadFilesStep,
  UploadPackageStep,
  UploadStatsStep,
} from "@/features/upload";

export const Route = createFileRoute("/upload")({
  component: UploadPage,
});

function UploadPage() {
  return (
    <Upload.Provider>
      <Upload.Frame>
        <Upload.Nav />
        <Upload.Stack>
          <UploadPackageStep />
          <UploadFilesStep />
          <UploadDeployStep />
          <UploadStatsStep />
        </Upload.Stack>
      </Upload.Frame>
    </Upload.Provider>
  );
}
