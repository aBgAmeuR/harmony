import { DialogFooter, DialogTitle } from "@harmony/ui/components/dialog";
import { Skeleton } from "@harmony/ui/components/skeleton";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { formatRangeTitle, monthEnd } from "@/features/filter-period/lib";
import { format } from "@/shared/lib/format";

import { monthlyQuery, totalsQuery } from "../api";
import { DateRangeBrush } from "./date-range-brush";
import { DateRangeDialogFooter } from "./date-range-dialog-footer";
import { DateRangeDraftProvider, useDateRangeDraftContext } from "./date-range-draft-context";
import { DateRangePresets } from "./date-range-presets";

const MODES = { month: "Month", year: "Year", custom: "Custom" } as const;

const DateRangeTotals = ({ from, to }: { from: Date; to: Date }) => {
  const { data } = useQuery({ ...totalsQuery({ from, to }), placeholderData: keepPreviousData });

  if (!data) return <Skeleton className="h-5 w-16" />;

  return (
    <span className="text-sm font-semibold tabular-nums">{format.as(data.minutes, "minutes")}</span>
  );
};

const DateRangeDialogBody = ({ open }: { open: boolean }) => {
  const { draft, draftRange, setRange } = useDateRangeDraftContext();
  const { data: months = [], isLoading } = useQuery({ ...monthlyQuery(), enabled: open });

  const overlaps = (start: Date) =>
    draftRange !== null && start <= draftRange.to && monthEnd(start) >= draftRange.from;
  const first = months.findIndex((month) => overlaps(month.start));
  const span =
    first === -1 ? null : { first, last: months.findLastIndex((m) => overlaps(m.start)) };

  const selectMonths = (a: number, b: number) => {
    const from = months[Math.min(a, b)];
    const to = months[Math.max(a, b)];
    if (from && to) setRange(from.start, monthEnd(to.start));
  };

  return (
    <>
      <div className="flex items-end justify-between gap-4 px-4 pt-3 pb-2">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">{MODES[draft.mode]}</span>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {draftRange ? formatRangeTitle(draft.mode, draftRange.from, draftRange.to) : "Period"}
          </DialogTitle>
        </div>
        {draftRange && <DateRangeTotals from={draftRange.from} to={draftRange.to} />}
      </div>
      <div className="px-4 pb-3">
        <DateRangePresets months={months} range={draftRange} onSelect={setRange} />
      </div>
      <div className="border-t px-4 pt-3 pb-2">
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <DateRangeBrush
            months={months}
            span={span}
            onSelect={selectMonths}
            onYear={(year) => setRange(new Date(year, 0, 1), new Date(year, 11, 31))}
          />
        )}
      </div>
      <DialogFooter className="m-0">
        <DateRangeDialogFooter />
      </DialogFooter>
    </>
  );
};

export const DateRangePanel = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
  <DateRangeDraftProvider open={open} onClose={onClose}>
    <DateRangeDialogBody open={open} />
  </DateRangeDraftProvider>
);
