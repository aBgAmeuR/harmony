import type { StepId, StepOutput } from "@harmony/upload";
import type { PropsWithChildren } from "react";

import { Icon, Cancel01Icon, Loading03Icon, Tick02Icon } from "@harmony/icons";
import { Badge } from "@harmony/ui/components/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@harmony/ui/components/tooltip";
import { cn } from "@harmony/ui/lib/utils";

import { format } from "@/utils/format";

const STEP_COUNTS: Record<StepId, { read: string; keep: string; drop: string }> = {
  extract_archive: { read: "scanned", keep: "files", drop: "skipped" },
  parse_interactions: { read: "files", keep: "plays", drop: "dropped" },
  normalize_interactions: { read: "plays", keep: "kept", drop: "rejected" },
  resolve_tracks: { read: "plays", keep: "matched", drop: "missed" },
  enrich_tracks: { read: "tracks", keep: "kept", drop: "dropped" },
  enrich_albums: { read: "albums", keep: "kept", drop: "dropped" },
  persist_interactions: { read: "listens", keep: "saved", drop: "dropped" },
};

const PipelineItem = ({ children, className }: PropsWithChildren<{ className?: string }>) => {
  return <div className={cn("flex items-center px-3 py-2", className)}>{children}</div>;
};

const PipelineItemHeader = ({ children, className }: PropsWithChildren<{ className?: string }>) => {
  return <div className={cn("flex items-center", className)}>{children}</div>;
};

const PipelineItemIcon = ({ status }: { status: "pending" | "running" | "done" | "error" }) => {
  switch (status) {
    case "pending":
      return (
        <div className="grid size-4 place-items-center">
          <div className="size-1.5 rounded-full bg-muted-foreground/35" />
        </div>
      );
    case "running":
      return <Icon icon={Loading03Icon} strokeWidth={2} className="size-4 animate-spin" />;
    case "done":
      return <Icon icon={Tick02Icon} strokeWidth={2} className="size-4 text-primary" />;
    case "error":
      return <Icon icon={Cancel01Icon} strokeWidth={2} className="size-4 text-destructive" />;
    default:
      return null;
  }
};

const PipelineItemLabel = ({ label, className }: { label: string; className?: string }) => {
  return (
    <span className={cn("mx-3 min-w-0 flex-1 text-sm text-foreground", className)}>{label}</span>
  );
};

const PipelineItemDuration = ({
  startAt,
  endAt,
  now,
}: {
  startAt?: string;
  endAt?: string;
  now?: number;
}) => {
  const startMs = startAt ? new Date(startAt).getTime() : 0;
  const endMs = endAt ? new Date(endAt).getTime() : now;
  const durationMs =
    endMs !== undefined && Number.isFinite(startMs) ? Math.max(0, endMs - startMs) : 0;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span className="min-w-[52px] text-right text-xs text-muted-foreground tabular-nums" />
        }
      >
        {format.duration(durationMs)}
      </TooltipTrigger>
      <TooltipContent>
        <span>{format.time(startAt)}</span>
        {endAt ? (
          <>
            <span>-</span>
            <span>{format.time(endAt)}</span>
          </>
        ) : null}
      </TooltipContent>
    </Tooltip>
  );
};

const PipelineItemOutput = ({ output, stepId }: { output?: StepOutput; stepId: StepId }) => {
  if (!output) {
    return null;
  }

  const copy = STEP_COUNTS[stepId];

  return (
    <Tooltip>
      <TooltipTrigger render={<Badge variant="secondary" className="me-1.5 shrink-0" />}>
        <span className="flex items-center gap-0.5">
          <Icon icon={Tick02Icon} className="size-3 text-primary" />
          {output.keep.toLocaleString()}
        </span>
        {output.drop > 0 ? (
          <span className="flex items-center gap-0.5">
            <Icon icon={Cancel01Icon} className="size-3 text-destructive" />
            {output.drop.toLocaleString()}
          </span>
        ) : null}
      </TooltipTrigger>
      <TooltipContent className="flex flex-col items-start gap-0.5">
        <p>
          {output.read.toLocaleString()} {copy.read}
        </p>
        <p>
          {output.keep.toLocaleString()} {copy.keep}
        </p>
        {output.drop > 0 ? (
          <p>
            {output.drop.toLocaleString()} {copy.drop}
          </p>
        ) : null}
      </TooltipContent>
    </Tooltip>
  );
};

export {
  PipelineItem,
  PipelineItemHeader,
  PipelineItemIcon,
  PipelineItemLabel,
  PipelineItemDuration,
  PipelineItemOutput,
};
