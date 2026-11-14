import { Button } from "@harmony/ui/components/button";
import { Dialog, DialogContent, DialogTrigger } from "@harmony/ui/components/dialog";
import { Drawer, DrawerContent, DrawerTrigger } from "@harmony/ui/components/drawer";
import { Spinner } from "@harmony/ui/components/spinner";
import { useIsMobile } from "@harmony/ui/hooks/use-mobile";
import { useQueryClient } from "@tanstack/react-query";
import { Suspense, lazy, useCallback } from "react";

import { packageQueries } from "@/entities/package";

import { monthlyQuery } from "../api";

const loadPanel = () => import("./date-range-panel");
const DateRangePanel = lazy(() => loadPanel().then((m) => ({ default: m.DateRangePanel })));

type DateRangeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerLabel: string;
};

export const DateRangeDialog = ({ open, onOpenChange, triggerLabel }: DateRangeDialogProps) => {
  const queryClient = useQueryClient();
  const mobile = useIsMobile();
  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);

  const prefetchDialogData = useCallback(() => {
    void queryClient.prefetchQuery(monthlyQuery());
    void queryClient.prefetchQuery(packageQueries.period());
    void loadPanel();
  }, [queryClient]);

  const trigger = (
    <Button variant="secondary" onMouseEnter={prefetchDialogData} onFocus={prefetchDialogData} />
  );
  const panel = (
    <Suspense
      fallback={
        <div className="flex h-72 items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <DateRangePanel open={open} onClose={handleClose} />
    </Suspense>
  );

  if (mobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerTrigger render={trigger}>{triggerLabel}</DrawerTrigger>
        <DrawerContent showSwipeHandle>{panel}</DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={trigger}>{triggerLabel}</DialogTrigger>
      <DialogContent className="gap-0 p-0 sm:max-w-xl" showCloseButton={false}>
        {panel}
      </DialogContent>
    </Dialog>
  );
};
