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

export const DocsModal = ({ children }: PropsWithChildren) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-lg [&>button:last-child]:hidden">
        <div className="overflow-y-auto">
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="px-6 pt-6 text-base">
              How to get your Spotify data package
            </DialogTitle>
            <DialogDescription asChild>
              <div className="p-6">
                <div className="[&_strong]:text-foreground space-y-4 [&_strong]:font-semibold">
                  <div className="space-y-1">
                    <p>
                      <strong>1. Access Privacy Settings</strong>
                    </p>
                    <p>
                      Go to your Spotify account page and navigate to Privacy
                      Settings.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p>
                      <strong>2. Request Data</strong>
                    </p>
                    <p>
                      In the "Download your data" section, click "Request" next
                      to "Extended streaming history".
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p>
                      <strong>3. Wait for Processing</strong>
                    </p>
                    <p>
                      Spotify will prepare your data. This may take a few days
                      to complete.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p>
                      <strong>4. Check Your Email</strong>
                    </p>
                    <p>
                      Once ready, you'll receive an email with a download link
                      for your data package.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p>
                      <strong>5. Download Package</strong>
                    </p>
                    <p>
                      Click the link in the email to download your data as a ZIP
                      file.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p>
                      <strong>Note:</strong> Your package will contain JSON
                      files with your listening history. Keep this data secure
                      as it contains personal information.
                    </p>
                  </div>
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
