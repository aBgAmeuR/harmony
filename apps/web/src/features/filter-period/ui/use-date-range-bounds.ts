import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { packageQueries } from "@/entities/package";
import { parsePeriodBounds } from "@/features/filter-period/lib";

export const useDateRangeBounds = () => {
  const { data: period } = useQuery(packageQueries.period());

  return useMemo(() => parsePeriodBounds(period), [period]);
};
