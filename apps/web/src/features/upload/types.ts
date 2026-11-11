export const STEP_ORDER = ["package", "files", "deploy", "stats"] as const;

export type Step = (typeof STEP_ORDER)[number];

export type UploadPhase = "idle" | "deploying" | "running" | "done" | "error";

export const CARD_TOP_PX = 180;

export const STEP_LABELS: Record<Step, string> = {
  package: "Choose Package",
  files: "Select Files",
  deploy: "Deploy",
  stats: "Package Stats",
};

// Once the upload has started, its earlier steps can no longer be revisited.
export const minStep = (locked: boolean): number => stepIndex(locked ? "deploy" : "package");

export const stepIndex = (step: Step): number => {
  return STEP_ORDER.indexOf(step);
};

export const stepAt = (index: number): Step | null => {
  return STEP_ORDER[index] ?? null;
};
