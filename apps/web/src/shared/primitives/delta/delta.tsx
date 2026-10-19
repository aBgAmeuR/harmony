import type { ComponentProps } from "react";

import { cn } from "@harmony/ui/lib/utils";

const labels = {
  // Relative change, as a fraction: 0.124 is "+12.4%".
  percent: (value: number) => {
    const pct = Math.abs(value * 100);
    return `${value > 0 ? "+" : value < 0 ? "-" : ""}${pct.toFixed(pct >= 100 ? 0 : 1)}%`;
  },
  // Places gained (positive) or lost in a ranking.
  places: (value: number) => `${value > 0 ? "▲" : "▼"}${Math.abs(value)}`,
  // A multiplier compared to 1: 1.4 is "1.4x".
  ratio: (value: number) => `${value.toLocaleString("en-US", { maximumFractionDigits: 1 })}x`,
} as const;

type DeltaProps = Omit<ComponentProps<"span">, "children"> & {
  // Empty when there is nothing to compare to.
  value: number | null;
  kind?: keyof typeof labels;
  // muted: gray whatever the sign, for a change that is not in focus.
  tone?: "auto" | "muted";
};

export const Delta = ({
  value,
  kind = "percent",
  tone = "auto",
  className,
  ...props
}: DeltaProps) => {
  const sign = value === null ? 0 : Math.sign(kind === "ratio" ? value - 1 : value);

  return (
    <span
      data-slot="delta"
      className={cn(
        "inline-flex items-center text-xs font-medium tabular-nums",
        tone === "muted" || sign === 0
          ? "text-muted-foreground"
          : sign > 0
            ? "text-chart-1"
            : "text-destructive",
        className,
      )}
      {...props}
    >
      {value === null || (kind === "places" && value === 0) ? "-" : labels[kind](value)}
    </span>
  );
};
