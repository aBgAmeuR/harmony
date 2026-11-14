import { buildInstantRangeQuery } from "@/shared/scope";
import { commitDateRangeDraft, snapshotDateRangeDraft } from "@/shared/scope";

import type { DateRangeDraft } from "./types";

import { monthEnd, toIsoDate } from "./format";

export { commitDateRangeDraft, snapshotDateRangeDraft };

export const buildDraftRangePreview = (draft: DateRangeDraft) => {
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
};

export const draftFromRange = (from: Date, to: Date) => {
  const cursorMs = new Date(from.getFullYear(), from.getMonth(), 1).getTime();
  const whole = from.getDate() === 1 && to.getTime() === monthEnd(to).getTime();
  const sameYear = from.getFullYear() === to.getFullYear();
  if (whole && sameYear && from.getMonth() === to.getMonth()) {
    return { mode: "month" as const, cursorMs };
  }
  if (whole && sameYear && from.getMonth() === 0 && to.getMonth() === 11) {
    return { mode: "year" as const, cursorMs };
  }
  return {
    mode: "custom" as const,
    cursorMs,
    customFrom: toIsoDate(from),
    customTo: toIsoDate(to),
  };
};
