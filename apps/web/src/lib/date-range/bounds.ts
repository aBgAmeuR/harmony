import type { PackagePeriod } from "@/features/packages/queries/period";

import type { DateRangeBounds } from "./types";

import { parsePeriodDate } from "./format";

export function parsePeriodBounds(period: PackagePeriod | null | undefined): DateRangeBounds {
  return {
    minDate: period?.startDate ? parsePeriodDate(period.startDate) : undefined,
    maxDate: period?.endDate ? parsePeriodDate(period.endDate) : undefined,
  };
}

export function buildYearRange(
  period: PackagePeriod | null | undefined,
  monthlyListenLabels?: string[],
): number[] {
  if (period?.startDate && period?.endDate) {
    const startYear = parsePeriodDate(period.startDate).getFullYear();
    const endYear = parsePeriodDate(period.endDate).getFullYear();
    return Array.from({ length: endYear - startYear + 1 }, (_, index) => startYear + index);
  }

  if (monthlyListenLabels?.length) {
    const yearSet = new Set(
      monthlyListenLabels.map((label) => Number.parseInt(label.slice(0, 4), 10)),
    );
    return [...yearSet].sort((a, b) => a - b);
  }

  return [new Date().getFullYear()];
}
