import { ButtonGroup } from "@harmony/ui/components/button-group";
import { useState } from "react";

import { DateRangeDialog } from "./date-range-dialog";
import { DateRangeStepButton } from "./date-range-step-button";
import { useDateRangeBounds } from "./use-date-range-bounds";
import { useDateRangeCommittedLabel } from "./use-date-range-committed-label";
import { useDateRangeStep } from "./use-date-range-step";

export function DateRangeFilter() {
  const [open, setOpen] = useState(false);
  const { mode, label } = useDateRangeCommittedLabel();
  const { minDate, maxDate } = useDateRangeBounds();
  const { canStepPrev, canStepNext, step } = useDateRangeStep({ minDate, maxDate });

  return (
    <ButtonGroup>
      {mode !== "custom" && (
        <DateRangeStepButton direction={-1} disabled={!canStepPrev} onStep={step} />
      )}

      <DateRangeDialog open={open} onOpenChange={setOpen} triggerLabel={label} />

      {mode !== "custom" && (
        <DateRangeStepButton direction={1} disabled={!canStepNext} onStep={step} />
      )}
    </ButtonGroup>
  );
}
