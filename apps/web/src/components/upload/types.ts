export type WizardStep = 0 | 1 | 2 | 3;

export const CARD_TOP_PX = 180;

export const STEP_CONFIG = [
  {
    label: "Choose Package",
    description: "Upload your .zip file",
  },
  {
    label: "Select Files",
    description: "Choose JSON configuration files",
  },
  {
    label: "Deploy",
    description: "Deploy to server",
  },
  {
    label: "Package Stats",
    description: "View package analytics",
  },
] as const;

export interface MockJsonFile {
  name: string;
  path: string;
  size: string;
}

export const MOCK_JSON_FILES: Array<MockJsonFile> = [
  { name: "config.json", path: "config/config.json", size: "2.4 KB" },
  { name: "routes.json", path: "config/routes.json", size: "1.1 KB" },
  { name: "middleware.json", path: "config/middleware.json", size: "0.8 KB" },
  { name: "schema.json", path: "schema.json", size: "12.3 KB" },
  { name: "env.json", path: "env.staging.json", size: "0.5 KB" },
];

export interface DeploymentStep {
  id: string;
  label: string;
  status: "pending" | "running" | "done" | "error";
}

export const MOCK_DEPLOY_STEPS: Array<DeploymentStep> = [
  { id: "validate", label: "Validating package integrity", status: "done" },
  { id: "extract", label: "Extracting selected files", status: "done" },
  { id: "configure", label: "Configuring environment", status: "done" },
  { id: "upload", label: "Uploading to server", status: "running" },
  { id: "finalize", label: "Finalizing deployment", status: "pending" },
];
