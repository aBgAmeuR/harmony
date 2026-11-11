import type { PipelineStep } from "@harmony/upload";

import { Badge } from "@harmony/ui/components/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@harmony/ui/components/tooltip";

import { Steps } from "@/shared/primitives/steps";

import { StepOutput } from "./step-output";

const Progress = ({ progress }: { progress: NonNullable<PipelineStep["progress"]> }) => {
  const { current, total, failed } = progress;
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

type PipelineProps = {
  steps: PipelineStep[];
  now?: number;
  className?: string;
};

export const Pipeline = ({ steps, now, className }: PipelineProps) => (
  <Steps className={className}>
    {steps.map((step) => (
      <Steps.Item key={step.id} status={step.status}>
        <Steps.Label className="me-auto">{step.label}</Steps.Label>
        {step.progress ? <Progress progress={step.progress} /> : null}
        <StepOutput output={step.output} stepId={step.id} />
        {step.startedAt ? (
          <Steps.Time
            start={step.startedAt}
            end={step.endedAt}
            now={step.endedAt ? undefined : now}
          />
        ) : null}
      </Steps.Item>
    ))}
  </Steps>
);
