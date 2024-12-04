import React from "react";
import { Separator } from "@repo/ui/separator";
import { Skeleton } from "@repo/ui/skeleton";

type TopListSkeletonProps = {
  length?: number;
  layout: "grid" | "list";
  showRank?: boolean;
};

const getRandomWidth = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const TopListSkeleton = ({
  length = 50,
  showRank = true,
}: TopListSkeletonProps) => {
  return (
    <div className="flex flex-col">
      {Array.from({ length }).map((_, index) => (
        <div key={index}>
          <article className="flex items-center space-x-2 py-4 sm:space-x-4">
            {showRank && (
              <span className="w-6 text-right text-sm font-medium text-muted-foreground">
                {index + 1}
              </span>
            )}
            <Skeleton className="aspect-square rounded-md object-cover size-16" />
            <div className="flex-1 space-y-1">
              <Skeleton
                className="h-4"
                style={{ maxWidth: `${getRandomWidth(150, 350)}px` }}
              />
              <Skeleton
                className="h-4"
                style={{ maxWidth: `${getRandomWidth(150, 350)}px` }}
              />
            </div>
          </article>
          {index < length - 1 && <Separator />}
        </div>
      ))}
    </div>
  );
};
