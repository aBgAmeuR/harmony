import { Button } from "@harmony/ui/components/button";
import { Dialog, DialogContent, DialogFooter, DialogTrigger } from "@harmony/ui/components/dialog";
import { Tabs, TabsList, TabsTrigger } from "@harmony/ui/components/tabs";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import type { DateRangeMode } from "@/lib/stores/date-range-store";

import { query } from "@/lib/query";

import { DateRangeBoundsProvider } from "./date-range-bounds-context";
import { DateRangeCustomTab } from "./date-range-custom-tab";
import { DateRangeDialogFooter } from "./date-range-dialog-footer";
import { DateRangeDraftProvider, useDateRangeDraftContext } from "./date-range-draft-context";
import { DateRangeMonthTab } from "./date-range-month-tab";
import { DateRangeSparkline } from "./date-range-sparkline";
import { DateRangeYearTab } from "./date-range-year-tab";

type DateRangeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerLabel: string;
};

function DateRangeActiveTab() {
  const { draft } = useDateRangeDraftContext();

  switch (draft.mode) {
    case "month":
      return <DateRangeMonthTab />;
    case "year":
      return <DateRangeYearTab />;
    case "custom":
      return <DateRangeCustomTab />;
  }
}

function DateRangeDialogBody({ open }: { open: boolean }) {
  const { draft, setMode } = useDateRangeDraftContext();
  const [monthlyListenLabels, setMonthlyListenLabels] = useState<string[]>();

  return (
    <DateRangeBoundsProvider monthlyListenLabels={monthlyListenLabels}>
      <Tabs value={draft.mode} onValueChange={(value) => setMode(value as DateRangeMode)}>
        <div className="border-b bg-muted/50 px-3.5 py-1.5">
          <TabsList className="w-full bg-transparent p-0.5">
            <TabsTrigger value="month" className="dark:data-active:bg-background">
              Month
            </TabsTrigger>
            <TabsTrigger value="year" className="dark:data-active:bg-background">
              Year
            </TabsTrigger>
            <TabsTrigger value="custom" className="dark:data-active:bg-background">
              Custom
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="border-b px-4 py-2">
          <DateRangeSparkline open={open} onDataLoaded={setMonthlyListenLabels} />
        </div>
        <div className="px-4 py-2">
          <DateRangeActiveTab />
        </div>
      </Tabs>
      <DialogFooter className="m-0">
        <DateRangeDialogFooter />
      </DialogFooter>
    </DateRangeBoundsProvider>
  );
}

export function DateRangeDialog({ open, onOpenChange, triggerLabel }: DateRangeDialogProps) {
  const queryClient = useQueryClient();
  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);

  const prefetchDialogData = useCallback(() => {
    void queryClient.prefetchQuery(query.interactions.monthlyListens.queryOptions());
    void queryClient.prefetchQuery(query.packages.period.queryOptions());
  }, [queryClient]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="secondary"
            onMouseEnter={prefetchDialogData}
            onFocus={prefetchDialogData}
          />
        }
      >
        {triggerLabel}
      </DialogTrigger>
      <DialogContent className="p-0" showCloseButton={false}>
        <DateRangeDraftProvider open={open} onClose={handleClose}>
          <DateRangeDialogBody open={open} />
        </DateRangeDraftProvider>
      </DialogContent>
    </Dialog>
  );
}
