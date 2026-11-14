import type { PackagePeriod } from "@/data/packages/period";

import { parsePeriodDate } from "./format";

export const parsePeriodBounds = (period: PackagePeriod | null | undefined) => {
  return {
    minDate: period?.startDate ? parsePeriodDate(period.startDate) : undefined,
    maxDate: period?.endDate ? parsePeriodDate(period.endDate) : undefined,
  };
};
