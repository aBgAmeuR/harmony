import {
  Upload,
  UploadDeployStep,
  UploadFilesStep,
  UploadPackageStep,
  UploadStatsStep,
} from "@/features/upload";

export const UploadPage = () => {
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
};
