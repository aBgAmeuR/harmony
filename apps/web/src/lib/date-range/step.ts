import { buildInstantRangeQuery, type DateRangeMode } from "@/lib/stores/date-range-store";

export function getSteppedCursorMs(cursorMs: number, mode: DateRangeMode, dir: -1 | 1): number {
  const d = new Date(cursorMs);
  if (mode === "month") d.setMonth(d.getMonth() + dir);
  else d.setFullYear(d.getFullYear() + dir);
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}

export function canStepInDirection(
  cursorMs: number,
  mode: DateRangeMode,
  dir: -1 | 1,
  minDate?: Date,
  maxDate?: Date,
): boolean {
  if (mode === "custom") return false;
  if (!minDate && !maxDate) return true;

  const steppedMs = getSteppedCursorMs(cursorMs, mode, dir);
  const { from, to } = buildInstantRangeQuery({
    mode,
    cursorMs: steppedMs,
    customFrom: null,
    customTo: null,
  });

  if (minDate && to < minDate) return false;
  if (maxDate && from > maxDate) return false;
  return true;
}
