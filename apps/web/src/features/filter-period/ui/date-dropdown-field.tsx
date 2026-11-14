import { Button } from "@harmony/ui/components/button";
import { Calendar } from "@harmony/ui/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@harmony/ui/components/popover";
import { useMemo, useState } from "react";

import { formatShortDate } from "@/features/filter-period/lib";

type DateDropdownFieldProps = {
  value: Date;
  onChange: (date: Date) => void;
  disabledBefore?: Date;
  disabledAfter?: Date;
};

export const DateDropdownField = ({
  value,
  onChange,
  disabledBefore,
  disabledAfter,
}: DateDropdownFieldProps) => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const disabledMatchers = useMemo(() => {
    const matchers: Array<{ before: Date } | { after: Date }> = [];
    if (disabledBefore) matchers.push({ before: disabledBefore });
    if (disabledAfter) matchers.push({ after: disabledAfter });
    return matchers;
  }, [disabledBefore, disabledAfter]);

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger render={<Button type="button" variant="ghost" className="font-normal" />}>
        {formatShortDate(value)}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          defaultMonth={value}
          disabled={disabledMatchers}
          onSelect={(date) => {
            if (date) {
              onChange(date);
              setPopoverOpen(false);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
};
