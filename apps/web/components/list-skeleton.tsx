import React from "react";
import { Separator } from "@repo/ui/separator";

import { CardSkeleton } from "./cards/music-item-card/skeleton";

type TopListSkeletonProps = {
  length?: number;
  layout?: "grid" | "list";
  showRank?: boolean;
};

export const ListSkeleton = ({
  length = 50,
  layout = "list",
  showRank = true,
}: TopListSkeletonProps) => {
  return (
    <div className="flex flex-col">
      {Array.from({ length }).map((_, index) => (
        <div key={index}>
          <CardSkeleton showRank={showRank} index={index} layout={layout} />
          {layout === "list" && index < length - 1 && <Separator />}
        </div>
      ))}
    </div>
  );
};
