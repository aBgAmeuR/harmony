import React from "react";
import { Separator } from "@repo/ui/separator";
import { Skeleton } from "@repo/ui/skeleton";

export const SkeletonRankList = () => {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 50 }).map((_, index) => (
        <div key={index}>
          <SkeletonCard />
          {index < 49 && <Separator />}
        </div>
      ))}
    </div>
  );
};

const SkeletonCard = () => {
  return <Skeleton className="h-16 my-4" />;
};
