import { useMemo } from "react";

import { canStepInDirection } from "@/lib/date-range";
import { useDateRangeStore } from "@/lib/stores/date-range-store";

type UseDateRangeStepOptions = {
  minDate?: Date;
  maxDate?: Date;
};

export function useDateRangeStep({ minDate, maxDate }: UseDateRangeStepOptions) {
  const mode = useDateRangeStore((s) => s.mode);
  const cursorMs = useDateRangeStore((s) => s.cursorMs);
  const step = useDateRangeStore((s) => s.step);

  const canStepPrev = useMemo(
    () => canStepInDirection(cursorMs, mode, -1, minDate, maxDate),
    [cursorMs, mode, minDate, maxDate],
  );

  const canStepNext = useMemo(
    () => canStepInDirection(cursorMs, mode, 1, minDate, maxDate),
    [cursorMs, mode, minDate, maxDate],
  );

  return { mode, canStepPrev, canStepNext, step };
}
