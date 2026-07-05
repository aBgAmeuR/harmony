import { useMemo } from "react";

import { formatMonthYearLabel, formatShortDate } from "@/lib/date-range";
import { useDateRangeStore, useInstantRangeQuery } from "@/lib/stores/date-range-store";

export function useDateRangeCommittedLabel() {
  const mode = useDateRangeStore((s) => s.mode);
  const { from, to } = useInstantRangeQuery();

  const label = useMemo(() => {
    if (mode === "month") return formatMonthYearLabel(from);
    if (mode === "year") return String(from.getFullYear());
    return `${formatShortDate(from)} - ${formatShortDate(to)}`;
  }, [mode, from, to]);

  return { mode, label };
}
