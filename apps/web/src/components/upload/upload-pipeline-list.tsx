import type { PipelineStep } from "@harmony/upload";
import { Badge } from "@harmony/ui/components/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@harmony/ui/components/tooltip";
import { cn } from "@harmony/ui/lib/utils";
import {
  PipelineItem,
  PipelineItemDuration,
  PipelineItemHeader,
  PipelineItemIcon,
  PipelineItemLabel,
} from "@/components/pipeline";

type UploadPipelineListProps = {
  steps: PipelineStep[];
  nowTs: number;
};

function StepProgressBadge({ step }: { step: PipelineStep }) {
  if (!step.progress) {
    return null;
  }

  const { current, total, failed } = step.progress;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Badge variant="secondary" className="gap-1.5 shrink-0 me-1.5" />
        }
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
              <PipelineItemIcon status={step.status} />
              <PipelineItemLabel
                label={step.label}
                className={cn(
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
            {/* {showContent ? (
              <PipelineItemContent>
                {step.status === "error" && step.error ? (
                  <p className="text-destructive">{step.error}</p>
                ) : null}
                {detail}
              </PipelineItemContent>
            ) : null} */}
          </PipelineItem>
        );
      })}
    </div>
  );
}
