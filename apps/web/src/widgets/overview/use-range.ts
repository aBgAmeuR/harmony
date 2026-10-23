import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { clampRange, type Range } from "@/data/overview/range";
import { packageQueries } from "@/entities/package";
import { usePeriod } from "@/shared/scope";

// `full` is the range picked in the filter, `range` stops at the package's last listening day.
export const useRanges = (): { range: Range; full: Range } => {
  const full = usePeriod();
  const { data } = useQuery(packageQueries.period.queryOptions());
  const endDate = data?.endDate;

  return useMemo(() => ({ range: clampRange(full, endDate), full }), [full, endDate]);
};
