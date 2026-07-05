import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { buildYearRange, parsePeriodBounds } from "@/lib/date-range";
import { query } from "@/lib/query";

export function useDateRangeBounds(monthlyListenLabels?: string[]) {
  const { data: period } = useQuery(query.packages.period.queryOptions());

  const { minDate, maxDate } = useMemo(() => parsePeriodBounds(period), [period]);

  const years = useMemo(
    () => buildYearRange(period, monthlyListenLabels),
    [period, monthlyListenLabels],
  );

  return { period, minDate, maxDate, years };
}
