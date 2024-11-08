import React from "react";

import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type TopListSkeletonProps = {
  length: number;
};

export const TopListSkeleton = ({ length = 3 }: TopListSkeletonProps) => {
  return (
    <div className="flex flex-col gap-1">
      {Array.from({ length }).map((_, index) => (
        <div key={index}>
          <Skeleton className="my-4 h-16" />
          {index < length - 1 && <Separator />}
        </div>
      ))}
    </div>
  );
};
