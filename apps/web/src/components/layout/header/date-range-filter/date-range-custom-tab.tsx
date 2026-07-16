import { DateDropdownField } from "./date-dropdown-field";
import { useDateRangeBoundsContext } from "./date-range-bounds-context";
import { useDateRangeDraftContext } from "./date-range-draft-context";

export function DateRangeCustomTab() {
  const { draftCustomFrom, draftCustomTo, setCustomFrom, setCustomTo } = useDateRangeDraftContext();
  const { minDate, maxDate } = useDateRangeBoundsContext();

  return (
    <div className="flex gap-3">
      <DateDropdownField
        label="From"
        value={draftCustomFrom}
        disabledBefore={minDate}
        disabledAfter={draftCustomTo ?? maxDate}
        onChange={setCustomFrom}
      />
      <DateDropdownField
        label="To"
        value={draftCustomTo}
        disabledBefore={draftCustomFrom ?? minDate}
        disabledAfter={maxDate}
        onChange={setCustomTo}
      />
    </div>
  );
}
