import React from "react";
import { Separator } from "@repo/ui/separator";
import { Skeleton } from "@repo/ui/skeleton";

type TopListSkeletonProps = {
  length?: number;
  layout: "grid" | "list";
};

export const TopListSkeleton = ({ length = 50 }: TopListSkeletonProps) => {
  return (
    <div className="flex flex-col">
      {Array.from({ length }).map((_, index) => (
        <div key={index}>
          <Skeleton className="my-4 h-16" />
          {index < length - 1 && <Separator />}
        </div>
      ))}
    </div>
  );
};
