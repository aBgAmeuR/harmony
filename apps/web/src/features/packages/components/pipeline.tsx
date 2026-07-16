import { Alert02Icon, Cancel01Icon, Icon, Tick02Icon } from "@harmony/icons";
import { Badge } from "@harmony/ui/components/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@harmony/ui/components/tooltip";
import { PipelineStep, StepId } from "@harmony/upload";

import {
  PipelineItem,
  PipelineItemDuration,
  PipelineItemIcon,
  PipelineItemLabel,
} from "@/components/pipeline";

export function Pipeline({ steps }: { steps: PipelineStep[] }) {
  return (
    <div className="divide-y divide-border/50 rounded-lg bg-card">
      {steps.map((item) => (
        <PipelineItem key={item.id}>
          <PipelineItemIcon status={item.status} />
          <PipelineItemLabel label={item.label} />
          <PipelineItemOutput output={item.output} stepId={item.id} />
          <PipelineItemDuration startAt={item.startedAt} endAt={item.endedAt} />
        </PipelineItem>
      ))}
    </div>
  );
}

function PipelineItemOutput({
  output,
  stepId,
}: {
  output?: Record<string, unknown>;
  stepId: StepId;
}) {
  switch (stepId) {
    case "extract_archive":
      const filesCount = output?.filesCount as number;
      if (filesCount === undefined) return null;
      return (
        <Tooltip>
          <TooltipTrigger render={<Badge variant="secondary" />}>
            {filesCount.toLocaleString()} files
          </TooltipTrigger>
          <TooltipContent>
            <p>{filesCount.toLocaleString()} files extracted</p>
          </TooltipContent>
        </Tooltip>
      );
    case "parse_interactions":
      const validated = output?.validated as number;
      const invalid = output?.invalid as number;
      if (validated === undefined || invalid === undefined) return null;
      return (
        <Tooltip>
          <TooltipTrigger render={<Badge variant="secondary" />}>
            <div className="flex items-center gap-0.5">
              <Icon icon={Tick02Icon} className="size-3 text-primary" />
              {validated.toLocaleString()}
            </div>
            <div className="flex items-center gap-0.5">
              <Icon icon={Cancel01Icon} className="size-3 text-destructive" />
              {invalid.toLocaleString()}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{validated.toLocaleString()} validated</p>
            <p>-</p>
            <p>{invalid.toLocaleString()} invalid</p>
          </TooltipContent>
        </Tooltip>
      );
    case "normalize_interactions":
      const kept = output?.kept as number;
      const rejected = output?.rejected as number;
      if (kept === undefined || rejected === undefined) return null;
      return (
        <Tooltip>
          <TooltipTrigger render={<Badge variant="secondary" />}>
            <div className="flex items-center gap-0.5">
              <Icon icon={Tick02Icon} className="size-3 text-primary" />
              {kept.toLocaleString()}
            </div>
            <div className="flex items-center gap-0.5">
              <Icon icon={Cancel01Icon} className="size-3 text-destructive" />
              {rejected.toLocaleString()}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{kept.toLocaleString()} kept</p>
            <p>-</p>
            <p>{rejected.toLocaleString()} rejected</p>
          </TooltipContent>
        </Tooltip>
      );
    case "resolve_tracks":
      const resolved = output?.resolved as number;
      const missed = output?.missed as number;
      const errors = output?.errors as number;
      if (resolved === undefined || missed === undefined || errors === undefined) return null;
      return (
        <Tooltip>
          <TooltipTrigger render={<Badge variant="secondary" />}>
            <div className="flex items-center gap-0.5">
              <Icon icon={Tick02Icon} className="size-3 text-primary" />
              {resolved.toLocaleString()}
            </div>
            <div className="flex items-center gap-0.5">
              <Icon icon={Alert02Icon} className="size-3 text-yellow-600" />
              {missed.toLocaleString()}
            </div>
            <div className="flex items-center gap-0.5">
              <Icon icon={Cancel01Icon} className="size-3 text-destructive" />
              {errors.toLocaleString()}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{resolved.toLocaleString()} resolved</p>
            <p>-</p>
            <p>{missed.toLocaleString()} missed</p>
            <p>-</p>
            <p>{errors.toLocaleString()} errors</p>
          </TooltipContent>
        </Tooltip>
      );
    case "enrich_tracks":
      const tracksCompleted = output?.completed as number;
      const tracksFailed = output?.failed as number;
      if (tracksCompleted === undefined || tracksFailed === undefined) return null;
      return (
        <Tooltip>
          <TooltipTrigger render={<Badge variant="secondary" />}>
            <div className="flex items-center gap-0.5">
              <Icon icon={Tick02Icon} className="size-3 text-primary" />
              {tracksCompleted.toLocaleString()}
            </div>
            <div className="flex items-center gap-0.5">
              <Icon icon={Cancel01Icon} className="size-3 text-destructive" />
              {tracksFailed.toLocaleString()}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tracksCompleted.toLocaleString()} completed</p>
            <p>-</p>
            <p>{tracksFailed.toLocaleString()} failed</p>
          </TooltipContent>
        </Tooltip>
      );
    case "enrich_albums":
      const albumsCompleted = output?.completed as number;
      const albumsFailed = output?.failed as number;
      if (albumsCompleted === undefined || albumsFailed === undefined) return null;
      return (
        <Tooltip>
          <TooltipTrigger render={<Badge variant="secondary" />}>
            <div className="flex items-center gap-0.5">
              <Icon icon={Tick02Icon} className="size-3 text-primary" />
              {albumsCompleted.toLocaleString()}
            </div>
            <div className="flex items-center gap-0.5">
              <Icon icon={Cancel01Icon} className="size-3 text-destructive" />
              {albumsFailed.toLocaleString()}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{albumsCompleted.toLocaleString()} completed</p>
            <p>-</p>
            <p>{albumsFailed.toLocaleString()} failed</p>
          </TooltipContent>
        </Tooltip>
      );
    case "persist_interactions":
      const interactions = output?.interactions as number;
      const tracks = output?.tracks as number;
      const albums = output?.albums as number;
      const artists = output?.artists as number;
      if (
        interactions === undefined ||
        tracks === undefined ||
        albums === undefined ||
        artists === undefined
      )
        return null;
      return (
        <Tooltip>
          <TooltipTrigger render={<Badge variant="secondary" />}>
            <div className="flex items-center gap-0.5">
              <Icon icon={Tick02Icon} className="size-3 text-primary" />
              {interactions.toLocaleString()}
            </div>
          </TooltipTrigger>
          <TooltipContent className="flex flex-col items-start gap-0.5">
            <p>{interactions.toLocaleString()} interactions</p>
            <p>{tracks.toLocaleString()} tracks</p>
            <p>{albums.toLocaleString()} albums</p>
            <p>{artists.toLocaleString()} artists</p>
          </TooltipContent>
        </Tooltip>
      );
    default:
      return null;
  }
}
