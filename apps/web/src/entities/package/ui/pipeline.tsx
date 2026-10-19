import type { PipelineStep } from "@harmony/upload";

import { Steps } from "@/shared/primitives/steps";

import { StepOutput } from "./step-output";

export const Pipeline = ({ steps }: { steps: PipelineStep[] }) => {
  return (
    <Steps>
      {steps.map((item) => (
        <Steps.Item key={item.id} status={item.status}>
          <Steps.Label>{item.label}</Steps.Label>
          <StepOutput output={item.output} stepId={item.id} />
          <Steps.Time start={item.startedAt} end={item.endedAt} />
        </Steps.Item>
      ))}
    </Steps>
  );
};
