import { PropsWithChildren } from "react";
import { Button } from "@repo/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/dialog";

export const HistoryModal = ({ children }: PropsWithChildren) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="mt-2">
          View History
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-lg [&>button:last-child]:hidden">
        <div className="overflow-y-auto">
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="px-6 pt-6 text-base">
              History of your uploaded Spotify data packages
            </DialogTitle>
            <DialogDescription asChild>
              <div className="p-6">
                <div className="[&_strong]:text-foreground space-y-4 [&_strong]:font-semibold">
                  {children}
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </div>
        <DialogFooter className="border-t px-4 py-2">
          <DialogClose asChild>
            <Button type="button">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
