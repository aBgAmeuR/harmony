import type { ListRow, Prop } from "@/data/bases";

import { format } from "@/shared/lib/format";
import { Num, type numSizes } from "@/shared/primitives/num";

type ValueProps = { row: ListRow; name: string; prop: Prop; size?: keyof typeof numSizes };

// One property of a row, in the format of its kind.
export const Value = ({ row, name, prop, size }: ValueProps) => {
  const value = row[name];
  if (value === null || value === undefined)
    return <span className="text-muted-foreground">-</span>;
  if (prop.kind === "flag") return <span>{value ? "Yes" : "No"}</span>;
  if (prop.kind === "date")
    return <span className="tabular-nums">{format.dateTime(String(value))}</span>;
  if (prop.kind === "text") return <span className="truncate">{String(value)}</span>;
  return <Num value={Number(value)} kind={prop.kind} size={size} />;
};

export const isNumeric = (prop: Prop): boolean =>
  prop.kind !== "flag" && prop.kind !== "date" && prop.kind !== "text";
