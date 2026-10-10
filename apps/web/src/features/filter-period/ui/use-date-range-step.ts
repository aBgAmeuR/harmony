import { useMemo } from "react";

import { canStepInDirection } from "@/features/filter-period/lib";
import { useDateRangeStore } from "@/shared/scope";

type UseDateRangeStepOptions = {
  minDate?: Date;
  maxDate?: Date;
};

export const useDateRangeStep = ({ minDate, maxDate }: UseDateRangeStepOptions) => {
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
};
