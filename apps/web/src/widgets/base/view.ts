import type { Op, Rule } from "@/data/filter";
import type { Range } from "@/shared/lib/date";

import {
  bases,
  EXPLORER_BASES,
  type Base,
  type Condition,
  type ExplorerBaseId,
  type ListQuery,
  type ViewType,
} from "@/data/bases";
import { isField } from "@/data/filter";
import { previousRange } from "@/shared/lib/date";

// A filter of a view: on a play field (artist, genre, shuffle…) or on a row property (streams…).
// `label` is what the chip shows for an id value, such as the artist's name.
export type ViewRule = { field: string; op: Op; value: string | number | boolean; label?: string };

// Everything a view can change. Unset keys use the base defaults, so URLs stay short.
export type ViewState = {
  base?: ExplorerBaseId;
  view?: ViewType;
  sort?: string;
  desc?: boolean;
  q?: string;
  rules?: ViewRule[];
  // Bars behind the rows of a list, for the sorted value. On unless turned off.
  bars?: boolean;
  // The places won or lost under each rank. On unless turned off.
  diffs?: boolean;
};

const OPS: readonly Op[] = ["is", "not", "gt", "lt"];

const oneOf = <T extends string>(values: readonly T[], value: unknown): T | undefined =>
  values.find((candidate) => candidate === value);

const ruleOf = (value: unknown): ViewRule[] => {
  if (!value || typeof value !== "object" || !("field" in value) || !("op" in value)) return [];
  const { field, op } = value;
  const raw = "value" in value ? value.value : undefined;
  const label = "label" in value && typeof value.label === "string" ? value.label : undefined;
  const opOk = oneOf(OPS, op);
  if (typeof field !== "string" || !opOk) return [];
  if (typeof raw !== "string" && typeof raw !== "number" && typeof raw !== "boolean") return [];
  return [{ field, op: opOk, value: raw, label }];
};

export const parseView = (raw: Record<string, unknown>): ViewState => ({
  base: oneOf(EXPLORER_BASES, raw.base),
  view: oneOf(["table", "gallery"] as const, raw.view),
  bars: raw.bars === false ? false : undefined,
  diffs: raw.diffs === false ? false : undefined,
  sort: typeof raw.sort === "string" ? raw.sort : undefined,
  desc: typeof raw.desc === "boolean" ? raw.desc : undefined,
  q: typeof raw.q === "string" && raw.q.trim() !== "" ? raw.q : undefined,
  rules: Array.isArray(raw.rules) ? raw.rules.flatMap(ruleOf) : undefined,
});

// The view with every default filled in, for one base.
export type View = {
  base: Base;
  view: ViewType;
  sort: string;
  desc: boolean;
  q: string;
  rules: ViewRule[];
  bars: boolean;
  diffs: boolean;
};

export const resolveView = (state: ViewState, fallback: ExplorerBaseId = "artists"): View => {
  const base = bases[state.base ?? fallback];
  const view = state.view && base.views.includes(state.view) ? state.view : "table";
  return {
    base,
    view,
    sort: state.sort ?? base.defaults.sort,
    desc: state.desc ?? base.defaults.desc,
    q: state.q ?? "",
    rules: state.rules ?? [],
    bars: state.bars ?? true,
    diffs: state.diffs ?? true,
  };
};

export const PAGE_SIZE = 50;

// The list query of a view. `fixed` rules come from the page (an artist page lists its tracks).
export const listQuery = (
  view: View,
  period: Range,
  limit: number,
  fixed: readonly Rule[] = [],
): ListQuery => {
  const rules: Rule[] = [...fixed];
  const conditions: Condition[] = [];
  for (const { field, op, value } of view.rules) {
    if (isField(field)) rules.push({ field, op, value });
    else conditions.push({ prop: field, op, value });
  }
  return {
    base: view.base.id,
    filter: { ...period, rules },
    conditions,
    search: view.q,
    sort: view.sort,
    desc: view.desc,
    limit,
    previous: { ...previousRange(period), rules },
  };
};

// Another base keeps the view: its layout, sort and search, and the rules on plays. What the
// base lacks, such as a gallery or a sorted property, falls back to its defaults.
export const switchBase = (view: View, base: ExplorerBaseId): ViewState => {
  const next = bases[base];
  const rules = view.rules.filter((rule) => isField(rule.field));
  return {
    base,
    view: next.views.includes(view.view) ? view.view : undefined,
    sort: Object.hasOwn(next.props, view.sort) ? view.sort : undefined,
    desc: Object.hasOwn(next.props, view.sort) ? view.desc : undefined,
    rules: rules.length > 0 ? rules : undefined,
  };
};
