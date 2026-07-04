import { cn } from "@harmony/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { useCallback, useMemo, useRef, useState } from "react";

import {
  clearUploadSession,
  loadUploadSession,
  saveUploadSession,
  type UploadSession,
} from "@/lib/upload-session";

import { Icons } from "../icons";
import { DecorativeFrame } from "./decorative-frame";
import { StepNavigation } from "./step-navigation";
import { DeployStep } from "./steps/deploy-step";
import { FilesStep } from "./steps/files-step";
import { PackageStep } from "./steps/package-step";
import { StatsStep } from "./steps/stats-step";
import { CARD_TOP_PX, type WizardStep } from "./types";

type UploadUiStepStatus = "pending" | "running" | "done" | "error";

type UploadUiStepKey =
  | "extract_archive"
  | "parse_interactions"
  | "normalize_interactions"
  | "resolve_tracks"
  | "enrich_tracks"
  | "persist_interactions";

type EnrichTracksStepData = {
  tracksToProcess: number;
  tracksProcessed: number;
  tracksSkipped: number;
};

type NormalizeInteractionsStepData = {
  rejectedCount: number;
  keptCount: number;
};

type UploadUiStepData = EnrichTracksStepData | NormalizeInteractionsStepData;

type UploadUiStep = {
  key: UploadUiStepKey;
  label: string;
  status: UploadUiStepStatus;
  startAt?: string;
  endAt?: string;
  error?: string;
  data?: UploadUiStepData;
};

// type UploadStepsSseEvent = {
//   type: 'steps'
//   data: {
//     seq: number
//     steps: Array<UploadUiStep>
//   }
// }

const PEEK_BOTTOM_PX = 75;

function parkTransform(cardHeight: number): string {
  const ty = Math.round(PEEK_BOTTOM_PX - CARD_TOP_PX - cardHeight * 0.925);
  return `translateY(${ty}px) scale(0.85)`;
}

function cardTransform(i: number, current: number, heights: Record<number, number>): string {
  if (i < current - 1) return "translateY(-210%)";
  if (i === current - 1) return parkTransform(heights[i] ?? 360);
  if (i === current) return "translateY(0px)";
  return "translateY(210%)";
}

function cardOpacity(i: number, current: number): number {
  if (i < current - 1) return 0;
  if (i === current - 1) return 0.5;
  if (i === current) return 1;
  return 0;
}

function cardZIndex(i: number, current: number): number {
  return i === current ? 30 : 0;
}

function getInitialWizardState() {
  const session = loadUploadSession();
  if (!session) {
    return {
      currentStep: 0 as WizardStep,
      isLockedAfterDeploy: false,
      resumePublicId: null as string | null,
      packageFileName: null as string | null,
      deploySelection: [] as string[],
      selectedFiles: [] as string[],
      uploadId: null as string | null,
    };
  }

  return {
    currentStep: 2 as WizardStep,
    isLockedAfterDeploy: true,
    resumePublicId: session.publicId,
    packageFileName: session.packageFileName,
    deploySelection: session.deploySelection,
    selectedFiles: session.selectedFiles,
    uploadId: session.publicId,
  };
}

export function UploadWizard() {
  const initialState = useMemo(() => getInitialWizardState(), []);
  const [currentStep, setCurrentStep] = useState<WizardStep>(initialState.currentStep);
  const [packageFile, setPackageFile] = useState<File | null>(null);
  const [packageFileName, setPackageFileName] = useState<string | null>(
    initialState.packageFileName,
  );
  const [selectedFiles, setSelectedFiles] = useState<Array<string>>(initialState.selectedFiles);
  const [isLockedAfterDeploy, setIsLockedAfterDeploy] = useState(initialState.isLockedAfterDeploy);
  const [uploadId, setUploadId] = useState<string | null>(initialState.uploadId);
  const [uploadSteps, setUploadSteps] = useState<Array<UploadUiStep> | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [deployRequestId, setDeployRequestId] = useState(0);
  const [deploySelection, setDeploySelection] = useState<Array<string>>(
    initialState.deploySelection,
  );
  const [resumePublicId, setResumePublicId] = useState<string | null>(initialState.resumePublicId);
  const lastSeqRef = useRef(0);

  const [cardHeights, setCardHeights] = useState<Record<number, number>>({});

  // const deployMutation = useMutation(
  //   api.uploads.uploads.upload.mutationOptions({
  //     onSuccess: (response) => {
  //       setMutationError(null)
  //       setUploadId(response.uploadId)
  //     },
  //     onError: (err) => {
  //       if (err instanceof Error) {
  //         setMutationError(err.message)
  //         return
  //       }
  //       setMutationError('Unable to deploy package.')
  //     },
  //   })
  // )

  const triggerDeploy = () => {
    if (!packageFile) return;
    if (selectedFiles.length === 0) return;

    setDeploySelection([...selectedFiles]);
    setResumePublicId(null);
    setUploadId(null);
    setUploadSteps(null);
    setMutationError(null);
    lastSeqRef.current = 0;
    setDeployRequestId((id) => id + 1);
  };

  const handlePackageSelect = (file: File | null) => {
    clearUploadSession();
    setResumePublicId(null);
    setPackageFileName(file?.name ?? null);
    setPackageFile(file);
    setSelectedFiles([]);
    setDeploySelection([]);
    setDeployRequestId(0);
    setUploadId(null);
    setIsLockedAfterDeploy(false);
    setCurrentStep(0);
  };

  const handleDeployActive = useCallback((session: UploadSession) => {
    saveUploadSession(session);
    setResumePublicId(session.publicId);
    setUploadId(session.publicId);
    setPackageFileName(session.packageFileName);
  }, []);

  // useEffect(() => {
  //   if (!uploadId) return

  //   const channel = `uploads/${uploadId}`
  //   const subscription = transmit.subscription(channel)

  //   void subscription.create().catch((err) => {
  //     if (err instanceof Error) setMutationError(err.message)
  //     else setMutationError('Unable to connect to upload progress.')
  //   })

  //   const unsubscribe = subscription.onMessage<UploadStepsSseEvent>((message) => {
  //     if (message.type !== 'steps') return
  //     const nextSeq = message.data.seq
  //     if (nextSeq <= lastSeqRef.current) return
  //     lastSeqRef.current = nextSeq
  //     setUploadSteps(message.data.steps)
  //   })

  //   return () => {
  //     unsubscribe()
  //     void subscription.delete()
  //   }
  // }, [uploadId])

  const cardRefs = useMemo(
    () =>
      ([0, 1, 2, 3] as const).map((idx) => (el: HTMLDivElement | null): (() => void) | void => {
        if (!el) return;
        const observer = new ResizeObserver(([entry]) => {
          if (!entry) return;
          const h = Math.round(entry.contentRect.height);
          setCardHeights((prev) => (prev[idx] === h ? prev : { ...prev, [idx]: h }));
        });
        observer.observe(el);
        return () => observer.disconnect();
      }),
    [],
  );

  const containerHeight = cardHeights[currentStep] ?? 360;
  const isUploadCompleted =
    uploadSteps?.find((s) => s.key === "persist_interactions")?.status === "done";

  const minNavigableStep: WizardStep = isLockedAfterDeploy ? 2 : 0;

  const goToStep = (step: WizardStep) => {
    if (step > currentStep) return;
    if (step < minNavigableStep) return;
    setCurrentStep(step);
  };
  const goForward = () => {
    if (currentStep < 3) {
      const next = (currentStep + 1) as WizardStep;
      if (currentStep === 1 && next === 2) {
        triggerDeploy();
      }
      if (currentStep === 2 && next === 3) {
        clearUploadSession();
        setResumePublicId(null);
      }
      if (next >= 2) {
        setIsLockedAfterDeploy(true);
      }
      setCurrentStep(next);
    }
  };
  const goBack = () => {
    if (currentStep <= minNavigableStep) return;
    setCurrentStep((s) => (s - 1) as WizardStep);
  };

  const cardSlots: Array<React.ReactNode> = [
    <>
      <PackageStep
        packageFile={packageFile}
        onPackageSelect={handlePackageSelect}
        onContinue={goForward}
      />
      <div className="mt-5 flex justify-center text-center">
        <p className="bg-background px-2 text-sm text-muted-foreground">
          <span>Don't have a package? </span>
          <a
            href="#"
            className="font-medium text-foreground underline decoration-[0.5px] underline-offset-2"
          >
            See a demo
          </a>
        </p>
      </div>
    </>,
    <FilesStep
      key="files"
      packageFile={packageFile}
      selectedFiles={selectedFiles}
      onSelectionChange={setSelectedFiles}
      onContinue={goForward}
      onBack={goBack}
    />,
    <DeployStep
      key="deploy"
      deployRequestId={deployRequestId}
      packageFile={packageFile}
      packageFileName={packageFileName}
      selectedFiles={deploySelection}
      resumePublicId={resumePublicId}
      mutationError={mutationError}
      onDeployActive={handleDeployActive}
      onRetry={triggerDeploy}
      onContinue={goForward}
    />,
    <StatsStep
      key="stats"
      packageName={packageFile?.name || packageFileName || "package.zip"}
      selectedFiles={selectedFiles}
      uploadId={uploadId}
      uploadCompleted={Boolean(isUploadCompleted)}
      onBack={goBack}
      canBack
    />,
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <DecorativeFrame cardHeight={containerHeight} />

      <div className="pointer-events-none absolute left-1/2 w-full max-w-152 -translate-x-1/2">
        <p className="absolute top-[180px] right-[calc(100%+3rem)] hidden pt-2 text-right text-sm font-medium whitespace-nowrap text-foreground/70 lg:block">
          Deploy Package
        </p>
      </div>

      <div className="mx-auto w-full max-w-152 px-6 pt-[180px] pb-24">
        <div className="relative">
          <StepNavigation
            currentStep={currentStep}
            minNavigableStep={minNavigableStep}
            onStepClick={goToStep}
          />
        </div>

        <div className="relative w-full" style={{ height: containerHeight }}>
          {cardSlots.map((slot, i) => {
            const isParked = i === currentStep - 1;
            const isHidden = i < currentStep - 1 || i > currentStep;
            const canClickParked = isParked && currentStep > minNavigableStep;

            return (
              <div
                key={i}
                ref={cardRefs[i]}
                onClick={canClickParked ? goBack : undefined}
                style={{
                  transform: cardTransform(i, currentStep, cardHeights),
                  opacity: cardOpacity(i, currentStep),
                  zIndex: cardZIndex(i, currentStep),
                }}
                className={cn(
                  "absolute inset-x-0 top-0",
                  "transition-[transform,opacity] duration-450 ease-in-out",
                  canClickParked &&
                    "cursor-pointer [&_a]:pointer-events-none [&_button]:pointer-events-none",
                  isHidden && "pointer-events-none",
                )}
              >
                {slot}
              </div>
            );
          })}
        </div>
      </div>

      <Link
        to="/"
        className="absolute bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-2 px-3 py-2"
      >
        <Icons.logo className="size-7!" />
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="scroll-m-20 truncate text-lg font-bold tracking-tight text-balance text-foreground">
            Harmony
          </span>
        </div>
      </Link>
    </div>
  );
}
