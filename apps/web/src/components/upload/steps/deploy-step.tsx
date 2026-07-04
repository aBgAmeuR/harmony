import { Button } from "@harmony/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@harmony/ui/components/card";
import { UploadError, type Pipeline, type PipelineRunStatus } from "@harmony/upload";
import { usePipeline } from "@harmony/upload/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { UploadPipelineList } from "@/components/upload/upload-pipeline-list";
import { upload } from "@/lib/upload";
import { clearUploadSession, type UploadSession } from "@/lib/upload-session";
import { format } from "@/utils/format";

interface DeployStepProps {
  deployRequestId: number;
  packageFile: File | null;
  packageFileName?: string | null;
  selectedFiles: Array<string>;
  resumePublicId?: string | null;
  mutationError?: string | null;
  onContinue: () => void;
  onRetry: () => void;
  onDeployActive?: (session: UploadSession) => void;
}

function getIsoMs(iso?: string): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime();
  return Number.isNaN(ms) ? null : ms;
}

function formatRunStatus(status: PipelineRunStatus): string {
  switch (status) {
    case "done":
      return "Completed";
    case "error":
      return "Failed";
    case "running":
      return "In progress";
    default:
      return "Waiting";
  }
}

export function DeployStep({
  deployRequestId,
  packageFile,
  packageFileName = null,
  selectedFiles,
  resumePublicId = null,
  mutationError = null,
  onContinue,
  onRetry,
  onDeployActive,
}: DeployStepProps) {
  const [nowTs, setNowTs] = useState(() => Date.now());
  const [publicId, setPublicId] = useState<string | null>(null);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const resumeAppliedRef = useRef(false);

  useEffect(() => {
    if (!publicId) {
      setPipeline(null);
      return;
    }

    const nextPipeline = upload.pipeline(publicId).connect();
    setPipeline(nextPipeline);

    return () => {
      nextPipeline.disconnect();
    };
  }, [publicId]);

  const { state: pipelineState, connectionError } = usePipeline(pipeline);

  const persistSession = useCallback(
    (nextPublicId: string) => {
      onDeployActive?.({
        publicId: nextPublicId,
        packageFileName: packageFile?.name ?? packageFileName ?? "package.zip",
        selectedFiles,
        deploySelection: selectedFiles,
      });
    },
    [onDeployActive, packageFile, packageFileName, selectedFiles],
  );

  const runDeploy = useCallback(async () => {
    if (!packageFile || selectedFiles.length === 0) return;

    setIsDeploying(true);
    setDeployError(null);
    setPublicId(null);

    try {
      const result = await upload.deploy({
        file: packageFile,
        selectedFiles,
      });
      setPublicId(result.publicId);
      persistSession(result.publicId);
    } catch (err) {
      if (err instanceof UploadError) {
        setDeployError(err.message);
        return;
      }
      if (err instanceof Error) {
        setDeployError(err.message);
        return;
      }
      setDeployError("Unable to deploy package.");
    } finally {
      setIsDeploying(false);
    }
  }, [packageFile, selectedFiles, persistSession]);

  useEffect(() => {
    if (deployRequestId === 0) return;
    resumeAppliedRef.current = false;
    void runDeploy();
  }, [deployRequestId, runDeploy]);

  useEffect(() => {
    if (!resumePublicId || resumeAppliedRef.current || deployRequestId > 0) {
      return;
    }

    resumeAppliedRef.current = true;
    setPublicId(resumePublicId);
  }, [resumePublicId, deployRequestId]);

  const handleRetry = () => {
    onRetry();
  };

  const handleCancel = () => {
    pipeline?.disconnect();
    clearUploadSession();
    window.location.reload();
  };

  useEffect(() => {
    const t = window.setInterval(() => {
      setNowTs(Date.now());
    }, 100);
    return () => window.clearInterval(t);
  }, []);

  const canRetry =
    pipelineState.runStatus === "error" &&
    Boolean(packageFile) &&
    selectedFiles.length > 0 &&
    !isDeploying;
  const canContinue = pipelineState.runStatus === "done";
  const errorMessage =
    pipelineState.error ?? deployError ?? connectionError ?? mutationError ?? null;

  const startMs = getIsoMs(pipelineState.startedAt);
  const endMs = getIsoMs(pipelineState.endedAt) ?? nowTs;
  const headerElapsed = startMs !== null ? format.duration(Math.max(0, endMs - startMs)) : "—";

  const headerStatus = isDeploying ? "Uploading…" : formatRunStatus(pipelineState.runStatus);

  const displayName = packageFile?.name ?? packageFileName ?? "No package selected";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deploy package</CardTitle>
        <CardDescription className="truncate">{displayName}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

        <div className="grid grid-cols-3 divide-x rounded-lg border">
          <div className="flex flex-col px-3 py-2">
            <span className="text-xs text-muted-foreground">Files included</span>
            <span className="text-sm font-medium text-foreground">
              {selectedFiles.length} JSON file
              {selectedFiles.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex flex-col px-3 py-2">
            <span className="text-xs text-muted-foreground">Time</span>
            <span className="text-sm font-medium text-foreground">{headerElapsed}</span>
          </div>
          <div className="flex flex-col px-3 py-2">
            <span className="text-xs text-muted-foreground">Status</span>
            <span className="text-sm font-medium text-primary">{headerStatus}</span>
          </div>
        </div>

        <UploadPipelineList steps={pipelineState.steps} nowTs={nowTs} />
      </CardContent>

      <CardFooter className="justify-between">
        <div className="flex items-center gap-2">
          <Button variant="destructive" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="ghost" disabled={!canRetry} onClick={handleRetry}>
            Retry deploy
          </Button>
        </div>

        <Button disabled={!canContinue} onClick={onContinue}>
          Continue
        </Button>
      </CardFooter>
    </Card>
  );
}
