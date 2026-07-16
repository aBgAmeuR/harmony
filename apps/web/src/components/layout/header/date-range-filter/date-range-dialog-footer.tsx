import { Button } from "@harmony/ui/components/button";
import { DialogClose } from "@harmony/ui/components/dialog";

import { useDateRangeDraftContext } from "./date-range-draft-context";

export function DateRangeDialogFooter() {
  const { isCustomIncomplete, commit } = useDateRangeDraftContext();

  return (
    <>
      <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
      <Button type="button" disabled={isCustomIncomplete} onClick={commit}>
        Confirm
      </Button>
    </>
  );
}
