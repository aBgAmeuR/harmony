import { Skeleton } from "@repo/ui/skeleton";

const getRandomWidth = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

type CardSkeletonProps = {
  showRank: boolean;
  index: number;
  layout?: "grid" | "list";
};

export const CardSkeleton = ({
  showRank,
  index,
  layout = "list",
}: CardSkeletonProps) => {
  return (
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
  );
};
