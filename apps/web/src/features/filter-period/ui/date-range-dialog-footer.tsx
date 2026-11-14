import { Button } from "@harmony/ui/components/button";
import { DialogClose } from "@harmony/ui/components/dialog";

import { DateDropdownField } from "./date-dropdown-field";
import { useDateRangeDraftContext } from "./date-range-draft-context";
import { useDateRangeBounds } from "./use-date-range-bounds";

export const DateRangeDialogFooter = () => {
  const { draftRange, isCustomIncomplete, setRange, commit } = useDateRangeDraftContext();
  const { minDate, maxDate } = useDateRangeBounds();

  return (
    <>
      {draftRange && (
        <div className="order-last flex items-center justify-center text-xs text-muted-foreground sm:order-none sm:mr-auto">
          <DateDropdownField
            value={draftRange.from}
            disabledBefore={minDate}
            disabledAfter={draftRange.to}
            onChange={(date) => setRange(date, draftRange.to)}
          />
          →
          <DateDropdownField
            value={draftRange.to}
            disabledBefore={draftRange.from}
            disabledAfter={maxDate}
            onChange={(date) => setRange(draftRange.from, date)}
          />
        </div>
      )}
      <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
      <Button type="button" disabled={isCustomIncomplete} onClick={commit}>
        Apply
      </Button>
    </>
  );
};
