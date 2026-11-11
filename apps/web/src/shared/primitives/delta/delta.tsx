import type { ComponentProps } from "react";

import { cn } from "@harmony/ui/lib/utils";

const labels = {
  // Relative change, as a fraction: 0.124 is "+12.4%".
  percent: (value: number) =>
    `${(value * 100).toLocaleString("en-US", {
      maximumFractionDigits: Math.abs(value) >= 1 ? 0 : 1,
      signDisplay: "exceptZero",
      useGrouping: false,
    })}%`,
  // A multiplier compared to 1: 1.4 is "1.4x".
  ratio: (value: number) => `${value.toLocaleString("en-US", { maximumFractionDigits: 1 })}x`,
} as const;

type DeltaProps = Omit<ComponentProps<"span">, "children"> & {
  value: number | null;
  kind?: keyof typeof labels;
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
        "inline-flex items-center text-xs font-medium text-muted-foreground tabular-nums",
        tone === "auto" && sign > 0 && "text-chart-1",
        tone === "auto" && sign < 0 && "text-destructive",
        className,
      )}
      {...props}
    >
      {value === null ? "-" : labels[kind](value)}
    </span>
  );
};
