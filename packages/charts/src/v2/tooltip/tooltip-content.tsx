export interface TooltipRow {
  color: string;
  label: string;
  value: number | string;
}

export interface TooltipContentProps {
  title?: string;
  rows: TooltipRow[];
  suffix?: string;
}

const intFmt = new Intl.NumberFormat("en-US").format;

export function TooltipContent({ title, rows, suffix }: TooltipContentProps) {
  return (
    <div className="grid items-start gap-1.5 rounded-md border border-border bg-background px-2 py-1.5 text-xs shadow-xl">
      {title ? <div className="font-medium">{title}</div> : null}
      <div className="grid gap-1.5">
        {rows.map((row) => (
          <div
            className="flex w-full flex-wrap items-center gap-1.5"
            key={`${row.label}-${row.color}`}
          >
            <span
              className="size-2.5 shrink-0 rounded-[2px]"
              style={{ backgroundColor: row.color }}
            />
            <div className="flex flex-1 items-center justify-between gap-2 leading-none">
              <span className="text-muted-foreground">{row.label}</span>
              <div className="flex items-center gap-0.5">
                <span className="font-medium text-foreground tabular-nums">
                  {typeof row.value === "number" ? intFmt(row.value) : row.value}
                </span>
                {suffix ? <span className="text-muted-foreground">{suffix}</span> : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
