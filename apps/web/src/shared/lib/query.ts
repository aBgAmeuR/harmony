import { queryOptions } from "@tanstack/react-query";

import { isoDay } from "./date";

const keyOf = (value: unknown): unknown => {
  if (value instanceof Date) return isoDay(value);
  if (Array.isArray(value)) return value.map(keyOf);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .map(([name, item]) => [name, keyOf(item)]),
    );
  }
  return value;
};

// Query options whose key is the name plus the arguments, so a loader and a component that pass
// the same arguments always share one cache entry. Days stand for dates in keys.
export const query =
  <P extends [] | [unknown], R>(name: string, fn: (...args: P) => Promise<R>) =>
  (...args: P) =>
    queryOptions({ queryKey: [name, ...args.map(keyOf)], queryFn: () => fn(...args) });
