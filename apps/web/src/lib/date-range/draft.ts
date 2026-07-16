import { buildInstantRangeQuery } from "@/lib/stores/date-range-store";
import { commitDateRangeDraft, snapshotDateRangeDraft } from "@/lib/stores/date-range-store";

import type { DateRangeDraft } from "./types";

export { commitDateRangeDraft, snapshotDateRangeDraft };

export function buildDraftRangePreview(draft: DateRangeDraft): { from: Date; to: Date } | null {
  try {
    return buildInstantRangeQuery(draft);
  } catch {
    if (draft.customFrom) {
      const from = new Date(draft.customFrom);
      return { from, to: draft.customTo ? new Date(draft.customTo) : from };
    }
    if (draft.customTo) {
      const to = new Date(draft.customTo);
      return { from: to, to };
    }
    return null;
  }
}

export function parseMonthLabel(label: string): { year: number; month: number } | null {
  const [yearStr, monthStr] = label.split("-");
  const year = Number.parseInt(yearStr ?? "", 10);
  const month = Number.parseInt(monthStr ?? "", 10);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return null;
  return { year, month };
}
