import { Button } from "@harmony/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@harmony/ui/components/card";
import { createPipeline, deploy as upload, type PipelineRunStatus } from "@harmony/upload";
import { usePipeline } from "@harmony/upload/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { prefetchEngine } from "@/data/packages/open";
import { Pipeline } from "@/entities/package";
import { format } from "@/shared/lib/format";

import { useUpload } from "../context";

const getIsoMs = (iso?: string): number | null => {
  if (!iso) return null;
  const ms = new Date(iso).getTime();
  return Number.isNaN(ms) ? null : ms;
};

const formatRunStatus = (status: PipelineRunStatus): string => {
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
};

export const UploadDeployStep = () => {
  const {
    state: { file, selection, publicId, deployAttempt, error, phase },
    actions: { next, deploy, reset, reportPublicId, reportPhase, reportError },
  } = useUpload();

  const [nowTs, setNowTs] = useState(() => Date.now());
  const [isDeploying, setIsDeploying] = useState(false);
  const lastAttemptRef = useRef(0);

  // Creating a pipeline has no side effects; the effect owns the SSE connection.
  const pipeline = useMemo(() => (publicId ? createPipeline(publicId) : null), [publicId]);

  useEffect(() => {
    if (!pipeline) {
      return;
    }

    pipeline.connect();
    prefetchEngine();

    return () => {
      pipeline.disconnect();
    };
  }, [pipeline]);
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

    let cancelled = false;

    const runDeploy = async () => {
      setIsDeploying(true);
      reportPhase("deploying");
      reportError(null);

      try {
        const result = await upload({ file, selectedFiles: selection });
        if (cancelled) return;
        reportPublicId(result.publicId);
      } catch (err) {
        if (cancelled) return;
        reportError(err instanceof Error ? err.message : "Unable to deploy package.");
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
  }, [deployAttempt, file, selection, reportPublicId, reportPhase, reportError]);

  const ticking = isDeploying || pipelineState.runStatus === "running";
  useEffect(() => {
    if (!ticking) return;
    const t = window.setInterval(() => {
      setNowTs(Date.now());
    }, 100);
    return () => window.clearInterval(t);
  }, [ticking]);

  // The upload itself or the pipeline after it may have failed.
  const canRetry =
    (pipelineState.runStatus === "error" || phase === "error") &&
    Boolean(file) &&
    selection.length > 0 &&
    !isDeploying;
  const canContinue = pipelineState.runStatus === "done";
  const errorMessage = pipelineState.error ?? connectionError ?? error ?? null;

  const startMs = getIsoMs(pipelineState.startedAt);
  const endMs = getIsoMs(pipelineState.endedAt) ?? nowTs;
  const headerElapsed =
    startMs !== null ? format.duration(Math.max(0, endMs - startMs)) : format.duration(0);
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

        <Pipeline steps={pipelineState.steps} now={nowTs} className="bg-transparent" />
        {pipelineState.stats ? (
          <p className="text-xs text-muted-foreground">
            {pipelineState.stats.calls.toLocaleString()} lookups •{" "}
            {pipelineState.stats.retries.toLocaleString()} retries •{" "}
            {pipelineState.stats.misses.toLocaleString()} missed
          </p>
        ) : null}
      </CardContent>

      <CardFooter className="justify-between">
        <div className="flex items-center gap-2">
          <Button variant="destructive" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="ghost" disabled={!canRetry} onClick={deploy}>
            Retry deploy
          </Button>
        </div>

        <Button disabled={!canContinue} onClick={next}>
          Continue
        </Button>
      </CardFooter>
    </Card>
  );
};
