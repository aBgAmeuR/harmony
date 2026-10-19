import type { PipelineStep } from "@harmony/upload";

import { Badge } from "@harmony/ui/components/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@harmony/ui/components/tooltip";

import { StepOutput } from "@/entities/package";
import { Steps } from "@/shared/primitives/steps";

type UploadPipelineProps = {
  steps: PipelineStep[];
  nowTs: number;
};

const StepProgressBadge = ({ step }: { step: PipelineStep }) => {
  if (!step.progress) {
    return null;
  }

  const { current, total, failed } = step.progress;

  return (
    <Tooltip>
      <TooltipTrigger render={<Badge variant="secondary" className="me-1.5 shrink-0 gap-1.5" />}>
        <span className="text-xs text-muted-foreground">
          {current.toLocaleString()} / {total.toLocaleString()}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {current.toLocaleString()} of {total.toLocaleString()} requests
          {failed > 0 ? ` • ${failed.toLocaleString()} failed` : ""}
        </p>
      </TooltipContent>
    </Tooltip>
  );
};

export const UploadPipeline = ({ steps, nowTs }: UploadPipelineProps) => {
  return (
    <Steps className="bg-transparent">
      {steps.map((step) => (
        <Steps.Item key={step.id} status={step.status}>
          <Steps.Label className="me-auto">{step.label}</Steps.Label>
          <StepProgressBadge step={step} />
          <StepOutput output={step.output} stepId={step.id} />
          {step.startedAt ? (
            <Steps.Time
              start={step.startedAt}
              end={step.endedAt}
              now={step.endedAt ? undefined : nowTs}
            />
          ) : null}
        </Steps.Item>
      ))}
    </Steps>
  );
};
