import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { packageQueries } from "@/entities/package";
import { clampRange, type Range } from "@/shared/lib/date";
import { usePeriod } from "@/shared/scope";

// `full` is the range picked in the filter, `range` stops at the package's last listening day.
export const useRanges = (): { range: Range; full: Range } => {
  const full = usePeriod();
  const { data } = useQuery(packageQueries.period());
  const endDate = data?.endDate;

  return useMemo(() => ({ range: clampRange(full, endDate), full }), [full, endDate]);
};
