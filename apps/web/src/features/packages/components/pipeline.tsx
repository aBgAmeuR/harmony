import type { PipelineStep } from "@harmony/upload";

import {
  PipelineItem,
  PipelineItemDuration,
  PipelineItemIcon,
  PipelineItemLabel,
  PipelineItemOutput,
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
