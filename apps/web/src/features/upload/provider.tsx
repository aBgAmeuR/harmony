import { PropsWithChildren, useEffect, useMemo, useState } from "react";

import { UploadContext, type UploadActions, type UploadState } from "./context";
import {
  cancelPendingSessionClear,
  clearUploadSession,
  loadUploadSession,
  saveUploadSession,
  scheduleSessionClear,
} from "./lib/session";
import { minStep, stepAt, stepIndex, type Step, type UploadPhase } from "./types";

const DEFAULT_CARD_HEIGHT = 360;

const createIdleState = (): UploadState => {
  return {
    step: "package",
    file: null,
    fileName: null,
    selection: [],
    publicId: null,
    phase: "idle",
    error: null,
    deployAttempt: 0,
    locked: false,
    cardHeight: DEFAULT_CARD_HEIGHT,
  };
};

const createStateFromSession = (): UploadState => {
  const session = loadUploadSession();
  if (!session) {
    return createIdleState();
  }

  return {
    step: "deploy",
    file: null,
    fileName: session.packageFileName,
    selection: session.deploySelection,
    publicId: session.publicId,
    phase: "running",
    error: null,
    deployAttempt: 0,
    locked: true,
    cardHeight: DEFAULT_CARD_HEIGHT,
  };
};

export const UploadProvider = ({ children }: PropsWithChildren) => {
  const [state, setState] = useState<UploadState>(() => createStateFromSession());

  useEffect(() => {
    cancelPendingSessionClear();
    return () => {
      scheduleSessionClear();
    };
  }, []);

  const actions = useMemo<UploadActions>(() => {
    const goTo = (step: Step) => {
      setState((prev) => {
        const current = stepIndex(prev.step);
        const target = stepIndex(step);
        const min = minStep(prev.locked);
        if (target > current) return prev;
        if (target < min) return prev;
        return { ...prev, step };
      });
    };

    const deployed = (prev: UploadState): UploadState =>
      !prev.file || prev.selection.length === 0
        ? prev
        : {
            ...prev,
            step: "deploy",
            locked: true,
            publicId: null,
            phase: "idle",
            error: null,
            deployAttempt: prev.deployAttempt + 1,
          };

    return {
      setFile: (file) => {
        clearUploadSession();
        setState((prev) => ({
          ...createIdleState(),
          cardHeight: prev.cardHeight,
          file,
          fileName: file?.name ?? null,
        }));
      },

      setSelection: (paths) => {
        setState((prev) => ({ ...prev, selection: paths }));
      },

      next: () => {
        setState((prev) => {
          const current = stepIndex(prev.step);
          const nextStep = stepAt(current + 1);
          if (!nextStep) return prev;

          if (nextStep === "deploy") return deployed(prev);

          if (prev.step === "deploy" && nextStep === "stats") {
            clearUploadSession();
            return {
              ...prev,
              step: "stats",
              locked: true,
            };
          }

          return {
            ...prev,
            step: nextStep,
            locked: prev.locked || stepIndex(nextStep) >= stepIndex("deploy"),
          };
        });
      },

      back: () => {
        setState((prev) => {
          const current = stepIndex(prev.step);
          const min = minStep(prev.locked);
          if (current <= min) return prev;
          const prevStep = stepAt(current - 1);
          if (!prevStep) return prev;
          return { ...prev, step: prevStep };
        });
      },

      goTo,

      deploy: () => setState(deployed),

      reset: () => {
        clearUploadSession();
        setState((prev) => ({
          ...createIdleState(),
          cardHeight: prev.cardHeight,
        }));
      },

      reportPublicId: (publicId) => {
        setState((prev) => {
          const packageFileName = prev.file?.name ?? prev.fileName ?? "package.zip";
          saveUploadSession({
            publicId,
            packageFileName,
            selectedFiles: prev.selection,
            deploySelection: prev.selection,
          });
          return {
            ...prev,
            publicId,
            fileName: packageFileName,
            phase: prev.phase === "idle" || prev.phase === "deploying" ? "running" : prev.phase,
          };
        });
      },

      reportPhase: (phase: UploadPhase) => {
        setState((prev) => ({ ...prev, phase }));
      },

      reportError: (error) => {
        setState((prev) => ({ ...prev, error }));
      },

      setCardHeight: (height) => {
        setState((prev) => (prev.cardHeight === height ? prev : { ...prev, cardHeight: height }));
      },
    };
  }, []);

  const value = useMemo(
    () => ({
      state,
      actions,
    }),
    [state, actions],
  );

  return <UploadContext value={value}>{children}</UploadContext>;
};
