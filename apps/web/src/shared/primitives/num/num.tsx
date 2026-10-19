import type { ComponentProps } from "react";

import { cn } from "@harmony/ui/lib/utils";

import { parts, type Kind } from "@/utils/format";

export const numSizes = {
  xs: { value: "text-xs font-medium", unit: "text-xs" },
  sm: { value: "text-xs font-semibold", unit: "text-xs" },
  md: { value: "text-sm font-semibold", unit: "text-xs" },
  lg: { value: "text-lg font-semibold", unit: "text-sm" },
  xl: {
    value: "text-3xl leading-none font-semibold tracking-tighter md:text-4xl",
    unit: "text-xl font-medium md:text-2xl",
  },
} as const;

type NumProps = Omit<ComponentProps<"span">, "children"> & {
  // Empty values show a dash.
  value: number | null | undefined;
  kind?: Kind;
  size?: keyof typeof numSizes;
};

// A number in its format: values in the current color, units muted.
export const Num = ({ value, kind = "count", size = "sm", className, ...props }: NumProps) => {
  const { value: v, unit: u } = numSizes[size];

  return (
    <span
      data-slot="num"
      data-size={size}
      className={cn("inline-flex items-baseline gap-1 tabular-nums", className)}
      {...props}
    >
      {value === null || value === undefined ? (
        <span className={v}>-</span>
      ) : (
        parts(value, kind).map((part) => (
          <span key={part.unit ?? "value"} className="inline-flex items-baseline gap-0.5">
            <span className={v}>{part.value}</span>
            {part.unit ? <span className={cn("text-muted-foreground", u)}>{part.unit}</span> : null}
          </span>
        ))
      )}
    </span>
  );
};
