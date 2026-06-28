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
