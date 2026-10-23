import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { packageQueries } from "@/entities/package";
import { buildYearRange, parsePeriodBounds } from "@/features/filter-period/lib";

export const useDateRangeBounds = (monthlyListenLabels?: string[]) => {
  const { data: period } = useQuery(packageQueries.period.queryOptions());

  const { minDate, maxDate } = useMemo(() => parsePeriodBounds(period), [period]);

  const years = useMemo(
    () => buildYearRange(period, monthlyListenLabels),
    [period, monthlyListenLabels],
  );

  return { period, minDate, maxDate, years };
};
