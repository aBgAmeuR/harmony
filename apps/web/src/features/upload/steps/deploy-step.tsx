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
import { useEffect, useMemo, useRef, useState } from "react";

import { createUploadClient } from "@/lib/upload";
import { format } from "@/utils/format";

import { useUpload } from "../context";
import { UploadPipeline } from "../pipeline";

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

export function UploadDeployStep() {
  const {
    state: { file, selection, publicId, deployAttempt, error: contextError },
    actions: { next, retry, reset, reportPublicId, reportPhase, reportError },
    meta: { apiUrl },
  } = useUpload();

  const [nowTs, setNowTs] = useState(() => Date.now());
  const [localPublicId, setLocalPublicId] = useState<string | null>(publicId);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const resumeAppliedRef = useRef(false);
  const lastAttemptRef = useRef(0);

  const upload = useMemo(() => createUploadClient(apiUrl), [apiUrl]);

  useEffect(() => {
    setLocalPublicId(publicId);
  }, [publicId]);

  useEffect(() => {
    if (!localPublicId) {
      setPipeline(null);
      return;
    }

    const nextPipeline = upload.pipeline(localPublicId).connect();
    setPipeline(nextPipeline);

    return () => {
      nextPipeline.disconnect();
    };
  }, [localPublicId, upload]);

  const { state: pipelineState, connectionError } = usePipeline(pipeline);

  useEffect(() => {
    if (pipelineState.runStatus === "done") {
      reportPhase("done");
      return;
    }
    if (pipelineState.runStatus === "error") {
      reportPhase("error");
      return;
    }
    if (pipelineState.runStatus === "running") {
      reportPhase("running");
    }
  }, [pipelineState.runStatus, reportPhase]);

  useEffect(() => {
    if (deployAttempt === 0) return;
    if (deployAttempt === lastAttemptRef.current) return;
    if (!file || selection.length === 0) return;

    lastAttemptRef.current = deployAttempt;
    resumeAppliedRef.current = false;

    let cancelled = false;

    const runDeploy = async () => {
      setIsDeploying(true);
      reportPhase("deploying");
      setDeployError(null);
      reportError(null);
      setLocalPublicId(null);

      try {
        const result = await upload.deploy({
          file,
          selectedFiles: selection,
        });
        if (cancelled) return;
        setLocalPublicId(result.publicId);
        reportPublicId(result.publicId);
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof UploadError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Unable to deploy package.";
        setDeployError(message);
        reportError(message);
        reportPhase("error");
      } finally {
        if (!cancelled) {
          setIsDeploying(false);
        }
      }
    };

    void runDeploy();

    return () => {
      cancelled = true;
    };
  }, [deployAttempt, file, selection, upload, reportPublicId, reportPhase, reportError]);

  useEffect(() => {
    if (!publicId || resumeAppliedRef.current || deployAttempt > 0) {
      return;
    }

    resumeAppliedRef.current = true;
    setLocalPublicId(publicId);
  }, [publicId, deployAttempt]);

  useEffect(() => {
    const t = window.setInterval(() => {
      setNowTs(Date.now());
    }, 100);
    return () => window.clearInterval(t);
  }, []);

  const canRetry =
    pipelineState.runStatus === "error" && Boolean(file) && selection.length > 0 && !isDeploying;
  const canContinue = pipelineState.runStatus === "done";
  const errorMessage =
    pipelineState.error ?? deployError ?? connectionError ?? contextError ?? null;

  const startMs = getIsoMs(pipelineState.startedAt);
  const endMs = getIsoMs(pipelineState.endedAt) ?? nowTs;
  const headerElapsed = startMs !== null ? format.duration(Math.max(0, endMs - startMs)) : format.duration(0);
  const headerStatus = isDeploying ? "Uploading…" : formatRunStatus(pipelineState.runStatus);

  const handleCancel = () => {
    pipeline?.disconnect();
    reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deploy package</CardTitle>
        {errorMessage && (
          <CardDescription className="text-destructive">{errorMessage}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 divide-x rounded-lg border">
          <div className="flex flex-col px-3 py-2">
            <span className="text-xs text-muted-foreground">Files included</span>
            <span className="text-sm font-medium text-foreground">
              {selection.length} JSON file
              {selection.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex flex-col px-3 py-2">
            <span className="text-xs text-muted-foreground">Time</span>
            <span className="text-sm font-medium text-foreground">{headerElapsed}</span>
          </div>
          <div className="flex flex-col px-3 py-2">
            <span className="text-xs text-muted-foreground">Status</span>
            <span className="text-sm font-medium">{headerStatus}</span>
          </div>
        </div>

        <UploadPipeline steps={pipelineState.steps} nowTs={nowTs} />
      </CardContent>

      <CardFooter className="justify-between">
        <div className="flex items-center gap-2">
          <Button variant="destructive" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="ghost" disabled={!canRetry} onClick={retry}>
            Retry deploy
          </Button>
        </div>

        <Button disabled={!canContinue} onClick={next}>
          Continue
        </Button>
      </CardFooter>
    </Card>
  );
}
