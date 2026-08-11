import { createContext, use } from "react";

import type { Step, UploadPhase } from "./types";

export type UploadState = {
  step: Step;
  file: File | null;
  fileName: string | null;
  selection: string[];
  publicId: string | null;
  phase: UploadPhase;
  error: string | null;
  deployAttempt: number;
  locked: boolean;
  cardHeight: number;
};

export type UploadActions = {
  setFile: (file: File | null) => void;
  setSelection: (paths: string[]) => void;
  next: () => void;
  back: () => void;
  goTo: (step: Step) => void;
  deploy: () => void;
  retry: () => void;
  reset: () => void;
  reportPublicId: (publicId: string) => void;
  reportPhase: (phase: UploadPhase) => void;
  reportError: (error: string | null) => void;
  setCardHeight: (height: number) => void;
};

export type UploadMeta = {
  apiUrl: string;
};

export type UploadContextValue = {
  state: UploadState;
  actions: UploadActions;
  meta: UploadMeta;
};

export const UploadContext = createContext<UploadContextValue | null>(null);

export function useUpload(): UploadContextValue {
  const value = use(UploadContext);
  if (!value) {
    throw new Error("useUpload must be used within Upload.Provider");
  }
  return value;
}
