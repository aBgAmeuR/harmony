import { Button } from "@harmony/ui/components/button";
import { Dialog, DialogContent, DialogTrigger } from "@harmony/ui/components/dialog";
import { Spinner } from "@harmony/ui/components/spinner";
import { useQueryClient } from "@tanstack/react-query";
import { Suspense, lazy, useCallback } from "react";

import { interactionQueries } from "@/entities/interaction";
import { packageQueries } from "@/entities/package";

const loadPanel = () => import("./date-range-panel");
const DateRangePanel = lazy(() => loadPanel().then((m) => ({ default: m.DateRangePanel })));

type DateRangeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerLabel: string;
};

export const DateRangeDialog = ({ open, onOpenChange, triggerLabel }: DateRangeDialogProps) => {
  const queryClient = useQueryClient();
  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);

  const prefetchDialogData = useCallback(() => {
    void queryClient.prefetchQuery(interactionQueries.monthlyListens.queryOptions());
    void queryClient.prefetchQuery(packageQueries.period.queryOptions());
    void loadPanel();
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
        <Suspense
          fallback={
            <div className="flex h-96 items-center justify-center">
              <Spinner />
            </div>
          }
        >
          <DateRangePanel open={open} onClose={handleClose} />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
};
