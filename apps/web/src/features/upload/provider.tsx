import { useRouteContext } from "@tanstack/react-router";
import { PropsWithChildren, useEffect, useMemo, useState } from "react";

import {
  cancelPendingSessionClear,
  clearUploadSession,
  loadUploadSession,
  saveUploadSession,
  scheduleSessionClear,
} from "@/lib/upload-session";

import { UploadContext, type UploadActions, type UploadState } from "./context";
import { stepAt, stepIndex, type Step, type UploadPhase } from "./types";

const DEFAULT_CARD_HEIGHT = 360;

function createIdleState(): UploadState {
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
}

function createStateFromSession(): UploadState {
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
}

export function UploadProvider({ children }: PropsWithChildren) {
  const { config } = useRouteContext({ from: "/upload" });
  const [state, setState] = useState<UploadState>(() => createStateFromSession());

  useEffect(() => {
    cancelPendingSessionClear();
    return () => {
      scheduleSessionClear();
    };
  }, []);

  const actions = useMemo<UploadActions>(() => {
    const minStep = (locked: boolean): Step => (locked ? "deploy" : "package");

    const goTo = (step: Step) => {
      setState((prev) => {
        const current = stepIndex(prev.step);
        const target = stepIndex(step);
        const min = stepIndex(minStep(prev.locked));
        if (target > current) return prev;
        if (target < min) return prev;
        return { ...prev, step };
      });
    };

    const startDeploy = () => {
      setState((prev) => {
        if (!prev.file || prev.selection.length === 0) return prev;
        return {
          ...prev,
          step: "deploy",
          locked: true,
          publicId: null,
          phase: "idle",
          error: null,
          deployAttempt: prev.deployAttempt + 1,
        };
      });
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

          if (prev.step === "files" && nextStep === "deploy") {
            if (!prev.file || prev.selection.length === 0) return prev;
            return {
              ...prev,
              step: "deploy",
              locked: true,
              publicId: null,
              phase: "idle",
              error: null,
              deployAttempt: prev.deployAttempt + 1,
            };
          }

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
          const min = stepIndex(minStep(prev.locked));
          if (current <= min) return prev;
          const prevStep = stepAt(current - 1);
          if (!prevStep) return prev;
          return { ...prev, step: prevStep };
        });
      },

      goTo,

      deploy: startDeploy,

      retry: startDeploy,

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
      meta: { apiUrl: config.apiUrl },
    }),
    [state, actions, config.apiUrl],
  );

  return <UploadContext value={value}>{children}</UploadContext>;
}
