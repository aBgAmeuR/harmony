import { useDateRangeBoundsContext } from "./date-range-bounds-context";
import { useDateRangeDraftContext } from "./date-range-draft-context";
import { YearGrid } from "./year-grid";

export function DateRangeYearTab() {
  const { draftCursor, setCursorYear } = useDateRangeDraftContext();
  const { years } = useDateRangeBoundsContext();

  return (
    <YearGrid years={years} selectedYear={draftCursor.getFullYear()} onSelect={setCursorYear} />
  );
}
