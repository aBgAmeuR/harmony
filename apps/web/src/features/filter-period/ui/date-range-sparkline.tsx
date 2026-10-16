import { Skeleton } from "@harmony/ui/components/skeleton";
import { cn } from "@harmony/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { memo, useEffect, useMemo } from "react";

import type { MonthlyListen } from "@/data/interactions/types";

import { interactionQueries } from "@/entities/interaction";
import { isDateInRange } from "@/features/filter-period/lib";

import { useDateRangeDraftContext } from "./date-range-draft-context";

type SparklineBarProps = {
  item: MonthlyListen;
  maxCount: number;
  highlighted: boolean;
  onSelect: (label: string) => void;
};

const SparklineBar = memo(({ item, maxCount, highlighted, onSelect }: SparklineBarProps) => {
  return (
    <button
      type="button"
      className="flex flex-1 cursor-pointer justify-center focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      style={{ height: `${(item.value / maxCount) * 100}%` }}
      onClick={() => onSelect(item.label)}
      aria-label={`Select ${item.label}`}
    >
      <span className={cn("size-full bg-primary/20", highlighted && "bg-primary/50")} />
    </button>
  );
});

type DateRangeSparklineProps = {
  open: boolean;
  onDataLoaded?: (labels: string[]) => void;
};

export const DateRangeSparkline = ({ open, onDataLoaded }: DateRangeSparklineProps) => {
  const { draftRange, selectMonthFromLabel } = useDateRangeDraftContext();

  const { data: monthlyListens, isLoading } = useQuery({
    ...interactionQueries.monthlyListens.queryOptions(),
    enabled: open,
  });

  const maxCount = useMemo(
    () => Math.max(1, ...(monthlyListens?.map((item) => item.value) ?? [1])),
    [monthlyListens],
  );

  const highlightedLabels = useMemo(() => {
    if (!draftRange || !monthlyListens) return new Set<string>();
    return new Set(
      monthlyListens
        .filter((item) =>
          isDateInRange(new Date(`${item.label}-01`), draftRange.from, draftRange.to),
        )
        .map((item) => item.label),
    );
  }, [draftRange, monthlyListens]);

  useEffect(() => {
    if (monthlyListens) {
      onDataLoaded?.(monthlyListens.map((item) => item.label));
    }
  }, [monthlyListens, onDataLoaded]);

  if (isLoading) {
    return (
      <div className="flex h-16 w-full items-end">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  return (
    <div className="flex h-16 w-full items-end">
      {monthlyListens?.map((item) => (
        <SparklineBar
          key={item.label}
          item={item}
          maxCount={maxCount}
          highlighted={highlightedLabels.has(item.label)}
          onSelect={selectMonthFromLabel}
        />
      ))}
    </div>
  );
};
