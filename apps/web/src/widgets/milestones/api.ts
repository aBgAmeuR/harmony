import { curveFn, marksFn, nextFn, recordsFn } from "@/data/milestones";
import { streakFn } from "@/data/streak";
import { query } from "@/shared/lib/query";

export const milestoneQueries = {
  marks: query("milestones-marks", marksFn),
  records: query("milestones-records", recordsFn),
  next: query("milestones-next", nextFn),
  curve: query("milestones-curve", curveFn),
  streak: query("milestones-streak", () => streakFn({})),
};
