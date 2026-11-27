import {
  COLUMN_IDS,
  COLUMNS,
  OPS,
  type ColumnId,
  type ExportOp,
  type ExportRule,
} from "@/data/export";

export type ExportState = {
  sort?: ColumnId;
  desc?: boolean;
  rules?: ExportRule[];
  hidden?: ColumnId[];
};

const columnOf = (value: unknown) => COLUMN_IDS.find((id) => id === value);

const opOf = (column: ColumnId, value: unknown) =>
  OPS[COLUMNS[column].type].find((op: ExportOp) => op === value);

const ruleOf = (raw: unknown): ExportRule[] => {
  if (!raw || typeof raw !== "object") return [];
  const column = columnOf("column" in raw ? raw.column : undefined);
  if (!column) return [];
  const op = opOf(column, "op" in raw ? raw.op : undefined);
  const value = "value" in raw ? raw.value : undefined;
  if (!op || (typeof value !== "string" && typeof value !== "number")) return [];
  return [{ column, op, value: String(value) }];
};

export const parseExport = (raw: Record<string, unknown>) => ({
  sort: columnOf(raw.sort),
  desc: typeof raw.desc === "boolean" ? raw.desc : undefined,
  rules: Array.isArray(raw.rules) ? raw.rules.flatMap(ruleOf) : undefined,
  hidden: Array.isArray(raw.hidden) ? raw.hidden.flatMap((id) => columnOf(id) ?? []) : undefined,
});

export const resolveExport = (state: ExportState) => {
  const hidden = state.hidden ?? [];
  return {
    sort: state.sort ?? "played_at",
    desc: state.desc ?? true,
    rules: state.rules ?? [],
    columns: COLUMN_IDS.filter((id) => !hidden.includes(id)),
  };
};

export type ExportView = ReturnType<typeof resolveExport>;
