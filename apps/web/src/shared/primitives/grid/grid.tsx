import type { ComponentProps } from "react";

import { cn } from "@harmony/ui/lib/utils";

const cols = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-1 lg:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
} as const;

const variants = {
  gap: "gap-3",
  // Cells side by side in one frame, split by hairlines. The fill stays inside the border so the
  // frame is not drawn twice.
  ruled:
    "gap-px overflow-hidden rounded-lg border border-border bg-border bg-clip-padding *:bg-card",
} as const;

type GridProps = ComponentProps<"div"> & {
  cols?: keyof typeof cols;
  variant?: keyof typeof variants;
};

export const Grid = ({ cols: n = 1, variant = "gap", className, ...props }: GridProps) => (
  <div
    data-slot="grid"
    data-variant={variant}
    className={cn("grid", cols[n], variants[variant], className)}
    {...props}
  />
);
