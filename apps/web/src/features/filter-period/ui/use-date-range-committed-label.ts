import { useMemo } from "react";

import { formatMonthYearLabel, formatShortDate } from "@/features/filter-period/lib";
import { useDateRangeStore, usePeriod } from "@/shared/scope";

export const useDateRangeCommittedLabel = () => {
  const mode = useDateRangeStore((s) => s.mode);
  const { from, to } = usePeriod();

  const label = useMemo(() => {
    if (mode === "month") return formatMonthYearLabel(from);
    if (mode === "year") return String(from.getFullYear());
    return `${formatShortDate(from)} - ${formatShortDate(to)}`;
  }, [mode, from, to]);

  return { mode, label };
};
