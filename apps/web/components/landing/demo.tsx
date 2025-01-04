"use client";

import { Skeleton } from "@repo/ui/skeleton";

import { useMounted } from "~/hooks/use-mounted";

export const Demo = () => {
  const isMounted = useMounted();

  return (
    <div className="w-full px-4 hidden md:block">
      <div className="mx-auto max-w-screen-xl aspect-video border rounded-lg overflow-hidden">
        {!isMounted ? (
          <Skeleton className="size-full" />
        ) : (
          <iframe src="/demo" className="size-full"></iframe>
        )}
      </div>
    </div>
  );
};
