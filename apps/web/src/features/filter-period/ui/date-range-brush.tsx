import { cn } from "@harmony/ui/lib/utils";
import { useRef, useState, type PointerEvent } from "react";

import { formatMonthYearLabel } from "@/features/filter-period/lib";
import { format } from "@/shared/lib/format";

type DateRangeBrushProps = {
  months: { start: Date; minutes: number }[];
  span: { first: number; last: number } | null;
  onSelect: (a: number, b: number) => void;
  onYear: (year: number) => void;
};

export const DateRangeBrush = ({ months, span, onSelect, onYear }: DateRangeBrushProps) => {
  const [hover, setHover] = useState<number>();
  const anchor = useRef<number>(undefined);
  const count = months.length;
  const max = Math.max(1, ...months.map((month) => month.minutes));
  const hovered = hover === undefined ? undefined : months[hover];
  const percent = (index: number) => `${(index / count) * 100}%`;

  const indexAt = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const index = Math.floor(((event.clientX - rect.left) / rect.width) * count);
    return Math.min(count - 1, Math.max(0, index));
  };

  return (
    <div className="flex flex-col gap-1">
      <div
        data-base-ui-swipe-ignore
        className="relative h-20 cursor-crosshair touch-none select-none"
        onPointerDown={(event) => {
          const index = indexAt(event);
          anchor.current = index;
          event.currentTarget.setPointerCapture(event.pointerId);
          onSelect(index, index);
        }}
        onPointerMove={(event) => {
          const index = indexAt(event);
          if (index === hover) return;
          setHover(index);
          if (anchor.current !== undefined) onSelect(anchor.current, index);
        }}
        onPointerUp={() => {
          anchor.current = undefined;
        }}
        onPointerLeave={() => setHover(undefined)}
      >
        {hovered && hover !== undefined && (
          <span
            className={cn(
              "pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-md border bg-popover px-1.5 py-0.5 text-micro whitespace-nowrap tabular-nums",
              hover < count / 6 && "translate-x-0",
              hover > (count * 5) / 6 && "-translate-x-full",
            )}
            style={{ left: percent(hover + 0.5) }}
          >
            {formatMonthYearLabel(hovered.start)} · {format.as(hovered.minutes, "minutes")}
          </span>
        )}
        <div className="flex h-full items-end gap-0.5">
          {months.map((month, index) => {
            const selected = span !== null && index >= span.first && index <= span.last;
            return (
              <span
                key={month.start.getTime()}
                className={cn(
                  "min-h-px flex-1 rounded-t-xs bg-chart-4",
                  index === hover && "bg-chart-3",
                  selected && "bg-chart-1",
                )}
                style={{ height: `${(month.minutes / max) * 100}%` }}
              />
            );
          })}
        </div>
        {span && (
          <div
            className="pointer-events-none absolute -top-2 bottom-0 border-x border-foreground bg-foreground/5"
            style={{ left: percent(span.first), width: percent(span.last - span.first + 1) }}
          >
            <span className="absolute top-1/2 -left-1 h-6 w-1.5 -translate-y-1/2 rounded-full bg-foreground" />
            <span className="absolute top-1/2 -right-1 h-6 w-1.5 -translate-y-1/2 rounded-full bg-foreground" />
          </div>
        )}
      </div>
      <div className="relative h-4">
        {months.map((month, index) =>
          month.start.getMonth() === 0 || (index === 0 && month.start.getMonth() < 10) ? (
            <button
              key={month.start.getTime()}
              type="button"
              className="absolute -ml-1 cursor-pointer rounded-sm px-1 text-micro text-muted-foreground hover:text-foreground"
              style={{ left: percent(index) }}
              onClick={() => onYear(month.start.getFullYear())}
            >
              {month.start.getFullYear()}
            </button>
          ) : null,
        )}
      </div>
    </div>
  );
};
