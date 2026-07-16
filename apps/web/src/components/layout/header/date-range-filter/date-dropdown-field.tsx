import { Button } from "@harmony/ui/components/button";
import { Calendar } from "@harmony/ui/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@harmony/ui/components/popover";
import { useMemo, useState } from "react";

import { formatShortDate } from "@/lib/date-range";

type DateDropdownFieldProps = {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  disabledBefore?: Date;
  disabledAfter?: Date;
};

export function DateDropdownField({
  label,
  value,
  onChange,
  disabledBefore,
  disabledAfter,
}: DateDropdownFieldProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const disabledMatchers = useMemo(() => {
    const matchers: Array<{ before: Date } | { after: Date }> = [];
    if (disabledBefore) matchers.push({ before: disabledBefore });
    if (disabledAfter) matchers.push({ after: disabledAfter });
    return matchers;
  }, [disabledBefore, disabledAfter]);

  return (
    <div className="flex flex-1 flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger
          render={
            <Button type="button" variant="outline" className="w-full justify-start font-normal" />
          }
        >
          {value ? formatShortDate(value) : "Pick a date"}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value ?? undefined}
            defaultMonth={value ?? undefined}
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
    </div>
  );
}
