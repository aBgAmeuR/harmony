import type { ReactNode } from "react";
import type { PipelineStep, StepId, StepStatus } from "@harmony/upload";
import { Badge } from "@harmony/ui/components/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@harmony/ui/components/tooltip";
import { cn } from "@harmony/ui/lib/utils";
import {
  PipelineItem,
  PipelineItemContent,
  PipelineItemDuration,
  PipelineItemHeader,
  PipelineItemIcon,
  PipelineItemLabel,
} from "@/components/pipeline";

type UploadPipelineListProps = {
  steps: PipelineStep[];
  nowTs: number;
};

type PipelineIconStatus = "pending" | "loading" | "done" | "error";

const PROGRESS_STEP_IDS: StepId[] = [
  "resolve_tracks",
  "enrich_tracks",
  "enrich_albums",
];

function toIconStatus(status: StepStatus): PipelineIconStatus {
  switch (status) {
    case "pending":
      return "pending";
    case "running":
      return "loading";
    case "done":
      return "done";
    case "error":
      return "error";
    default:
      return "pending";
  }
}

function readNumber(
  output: Record<string, unknown> | undefined,
  key: string,
): number | null {
  const value = output?.[key];
  return typeof value === "number" ? value : null;
}

function renderStepDetail(step: PipelineStep): ReactNode {
  const { output, progress } = step;

  if (
    progress &&
    step.status === "running" &&
    PROGRESS_STEP_IDS.includes(step.id)
  ) {
    const failed =
      progress.failed !== undefined ? ` • ${progress.failed} failed` : "";
    return (
      <span>
        {progress.current.toLocaleString()} / {progress.total.toLocaleString()}
        requests{failed}
      </span>
    );
  }

  if (!output) return null;

  switch (step.id) {
    case "extract_archive": {
      const filesCount = readNumber(output, "filesCount");
      return filesCount !== null ? (
        <span>{filesCount.toLocaleString()} files extracted</span>
      ) : null;
    }
    case "parse_interactions": {
      const validated = readNumber(output, "validated");
      const invalid = readNumber(output, "invalid");
      if (validated === null && invalid === null) return null;
      return (
        <span>
          {validated?.toLocaleString() ?? "0"} validated •{" "}
          {invalid?.toLocaleString() ?? "0"} invalid
        </span>
      );
    }
    case "normalize_interactions": {
      const kept = readNumber(output, "kept");
      const rejected = readNumber(output, "rejected");
      if (kept === null && rejected === null) return null;
      return (
        <span>
          {kept?.toLocaleString() ?? "0"} kept •{" "}
          {rejected?.toLocaleString() ?? "0"} rejected
        </span>
      );
    }
    case "resolve_tracks": {
      const resolved = readNumber(output, "resolved");
      const missed = readNumber(output, "missed");
      const errors = readNumber(output, "errors");
      if (resolved === null && missed === null && errors === null) return null;
      return (
        <span>
          {resolved?.toLocaleString() ?? "0"} resolved •{" "}
          {missed?.toLocaleString() ?? "0"} missed •{" "}
          {errors?.toLocaleString() ?? "0"} errors
        </span>
      );
    }
    case "enrich_tracks":
    case "enrich_albums": {
      const total = readNumber(output, "total");
      const fetched = readNumber(output, "fetched");
      const failed = readNumber(output, "failed");
      if (total === null && fetched === null && failed === null) return null;
      return (
        <span>
          {fetched?.toLocaleString() ?? "0"} fetched •{" "}
          {failed?.toLocaleString() ?? "0"} failed
          {total !== null ? ` of ${total.toLocaleString()}` : ""}
        </span>
      );
    }
    case "aggregate_interactions": {
      const interactions = readNumber(output, "interactions");
      const skipped = readNumber(output, "skipped");
      if (interactions === null && skipped === null) return null;
      return (
        <span>
          {interactions?.toLocaleString() ?? "0"} interactions •{" "}
          {skipped?.toLocaleString() ?? "0"} skipped
        </span>
      );
    }
    case "verify_data": {
      const tracksSkipped = readNumber(output, "tracksSkipped");
      const interactionsSkipped = readNumber(output, "interactionsSkipped");
      if (tracksSkipped === null && interactionsSkipped === null) return null;
      return (
        <span>
          {tracksSkipped?.toLocaleString() ?? "0"} tracks skipped •{" "}
          {interactionsSkipped?.toLocaleString() ?? "0"} interactions skipped
        </span>
      );
    }
    case "persist_interactions": {
      const interactions = readNumber(output, "interactions");
      const tracks = readNumber(output, "tracks");
      const albums = readNumber(output, "albums");
      const artists = readNumber(output, "artists");
      if (
        interactions === null &&
        tracks === null &&
        albums === null &&
        artists === null
      ) {
        return null;
      }
      return (
        <span>
          {interactions?.toLocaleString() ?? "0"} interactions •{" "}
          {tracks?.toLocaleString() ?? "0"} tracks •{" "}
          {albums?.toLocaleString() ?? "0"} albums •{" "}
          {artists?.toLocaleString() ?? "0"} artists
        </span>
      );
    }
    default:
      return null;
  }
}

function StepProgressBadge({ step }: { step: PipelineStep }) {
  if (
    step.status !== "running" ||
    !step.progress ||
    !PROGRESS_STEP_IDS.includes(step.id)
  ) {
    return null;
  }

  const { current, total, failed } = step.progress;

  return (
    <Tooltip>
      <TooltipTrigger
        render={<Badge variant="secondary" className="gap-1.5 shrink-0" />}
      >
        <span className="text-xs text-muted-foreground">
          {current.toLocaleString()} / {total.toLocaleString()}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {current.toLocaleString()} of {total.toLocaleString()} requests
          {failed !== undefined ? ` • ${failed.toLocaleString()} failed` : ""}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

export function UploadPipelineList({ steps, nowTs }: UploadPipelineListProps) {
  return (
    <div className="flex flex-col gap-px overflow-hidden rounded-lg border divide-y divide-border/50">
      {steps.map((step) => {
        const detail = renderStepDetail(step);
        const showContent = detail !== null || step.status === "error";

        return (
          <PipelineItem
            key={step.id}
            className={cn(
              "py-2",
              step.status === "done" && "bg-muted/10",
              step.status === "running" && "bg-primary/5",
              step.status === "pending" && "opacity-50",
            )}
          >
            <PipelineItemHeader>
              <PipelineItemIcon status={toIconStatus(step.status)} />
              <PipelineItemLabel
                label={step.label}
                className={cn(
                  step.status === "done" && "text-foreground/70",
                  step.status === "running" && "font-medium",
                  step.status === "pending" && "text-muted-foreground",
                )}
              />
              <StepProgressBadge step={step} />
              {step.startedAt ? (
                <PipelineItemDuration
                  startAt={step.startedAt}
                  endAt={step.endedAt}
                  now={step.endedAt ? undefined : nowTs}
                />
              ) : null}
            </PipelineItemHeader>
            {showContent ? (
              <PipelineItemContent>
                {step.status === "error" && step.error ? (
                  <p className="text-destructive">{step.error}</p>
                ) : null}
                {detail}
              </PipelineItemContent>
            ) : null}
          </PipelineItem>
        );
      })}
    </div>
  );
}
