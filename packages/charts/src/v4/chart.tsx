import type { ChartTooltipContent, ChartValue } from "@tanstack/charts";
import type { RendererChartProps } from "@tanstack/charts/react/tooltip";

import { cn } from "@harmony/ui/lib/utils";
import { motion } from "@tanstack/charts/motion";
import { RendererChart } from "@tanstack/charts/react/tooltip";

import { dataMotion } from "./theme";

// Minimal tooltip: a flat popover surface with a muted title, then one line per row with the
// value in white. The series dot only shows when there is more than one row to tell apart. A
// custom body replaces the native chrome, so the surface is drawn here.
const TooltipBody = ({ content }: { content: ChartTooltipContent | string }) => {
  const surface = "rounded-md border bg-popover px-2 py-1.5 text-xs text-popover-foreground";
  if (typeof content === "string") {
    return <div className={cn(surface, "whitespace-pre-line")}>{content}</div>;
  }
  const { title, rows } = content;
  const dots = rows.length > 1;

  return (
    <div className={cn(surface, "flex min-w-24 flex-col gap-0.5")}>
      {title ? <span className="text-muted-foreground">{title}</span> : null}
      {rows.map((row) => (
        <div key={row.label} className="flex items-center gap-1.5">
          {dots && row.color ? (
            <span className="size-1.5 shrink-0 rounded-full" style={{ background: row.color }} />
          ) : null}
          <span
            className={cn(
              "flex-1 truncate text-muted-foreground",
              (row.active || !dots) && "text-foreground/80",
            )}
          >
            {row.label}
          </span>
          <span className="ps-3 font-medium text-foreground tabular-nums">{row.value}</span>
        </div>
      ))}
    </div>
  );
};

// Motion renderer: tweens data changes like the old `svgAnimation` (no entrance on first paint)
// and lets the tooltip and cursor glide between points. Reduced motion snaps everything.
const renderer = motion({ initial: false, transition: dataMotion });

// The native React host with the Harmony font, text color, tooltip and motion. Every other prop
// is the native one: pass a memoized `defineChart` result as `definition`.
export const Chart = <
  TDatum,
  TX extends ChartValue = ChartValue,
  TY extends ChartValue = ChartValue,
>({
  className,
  renderTooltipBody = ({ content }) => <TooltipBody content={content} />,
  ...props
}: Omit<RendererChartProps<TDatum, TX, TY>, "renderer">) => (
  <RendererChart
    {...props}
    renderer={renderer}
    renderTooltipBody={renderTooltipBody}
    className={cn("text-xs text-foreground", className)}
  />
);
