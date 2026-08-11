export const STEP_ORDER = ["package", "files", "deploy", "stats"] as const;

export type Step = (typeof STEP_ORDER)[number];

export type UploadPhase = "idle" | "deploying" | "running" | "done" | "error";

export const CARD_TOP_PX = 180;

export const STEP_CONFIG: Record<Step, { label: string; description: string }> = {
  package: {
    label: "Choose Package",
    description: "Upload your .zip file",
  },
  files: {
    label: "Select Files",
    description: "Choose JSON configuration files",
  },
  deploy: {
    label: "Deploy",
    description: "Deploy to server",
  },
  stats: {
    label: "Package Stats",
    description: "View package analytics",
  },
};

export function stepIndex(step: Step): number {
  return STEP_ORDER.indexOf(step);
}

export function stepAt(index: number): Step | null {
  return STEP_ORDER[index] ?? null;
}
