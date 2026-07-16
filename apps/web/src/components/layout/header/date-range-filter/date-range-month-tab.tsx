import { MonthPicker } from "@harmony/ui/components/month-picker";

import { useDateRangeBoundsContext } from "./date-range-bounds-context";
import { useDateRangeDraftContext } from "./date-range-draft-context";

export function DateRangeMonthTab() {
  const { draftCursor, setCursorMonth } = useDateRangeDraftContext();
  const { minDate, maxDate } = useDateRangeBoundsContext();

  return (
    <MonthPicker
      minDate={minDate}
      maxDate={maxDate}
      selectedMonth={draftCursor}
      className="w-full p-0"
      onMonthSelect={setCursorMonth}
    />
  );
}
