"use client";

import { Button } from "@repo/ui/button";
import { CircleAlert } from "lucide-react";

export const MusicListError = () => {
  return (
    <div className="rounded-lg border border-border bg-background p-4 shadow-lg shadow-black/5">
      <div className="flex gap-2">
        <div className="flex grow gap-3">
          <CircleAlert
            className="mt-0.5 shrink-0 text-red-500"
            size={16}
            strokeWidth={2}
            aria-hidden="true"
          />
          <div className="flex grow flex-col gap-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                We couldn&lsquo;t complete your request!
              </p>
              <p className="text-sm text-muted-foreground">
                It indicates that an issue has prevented the processing of the
                request.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    // eslint-disable-next-line no-undef
                    window.location.reload();
                  }
                }}
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
