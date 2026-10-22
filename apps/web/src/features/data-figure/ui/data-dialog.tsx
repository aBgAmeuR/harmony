import type { ReactNode } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@harmony/ui/components/dialog";

type DataDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  // The figure controls, next to the title.
  actions?: ReactNode;
  children: ReactNode;
};

// A figure shown large.
export const DataDialog = ({ open, onOpenChange, title, actions, children }: DataDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="gap-4 sm:max-w-4xl">
      <DialogHeader className="flex-row items-center gap-2 pr-8">
        <DialogTitle>{title}</DialogTitle>
        <div className="ml-auto">{actions}</div>
      </DialogHeader>
      {children}
    </DialogContent>
  </Dialog>
);
