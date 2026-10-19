import type { ComponentProps, ReactNode } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@harmony/ui/components/tooltip";
import { cn } from "@harmony/ui/lib/utils";

const sizes = {
  xs: "h-0.5",
  sm: "h-1",
  md: "h-1.5",
  lg: "h-2",
} as const;

type MeterProps = Omit<ComponentProps<"div">, "children"> & {
  // One bar filled to value / max. Ignored when segments are given.
  value?: number;
  max?: number;
  size?: keyof typeof sizes;
  // Makes the bar a labelled meter for assistive tech, it is decorative without one.
  label?: string;
  // Meter.Seg elements, laid side by side by their value.
  children?: ReactNode;
};

const Root = ({
  value = 0,
  max = 100,
  size = "md",
  label,
  className,
  children,
  ...props
}: MeterProps) => {
  if (children) {
    return (
      <div
        data-slot="meter"
        className={cn("flex w-full gap-0.5 overflow-hidden rounded-full", sizes[size], className)}
        {...props}
      >
        {children}
      </div>
    );
  }

  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div
      data-slot="meter"
      role={label ? "meter" : undefined}
      aria-label={label}
      aria-valuenow={label ? value : undefined}
      aria-valuemin={label ? 0 : undefined}
      aria-valuemax={label ? max : undefined}
      aria-hidden={label ? undefined : true}
      className={cn("w-full rounded-full bg-muted", sizes[size], className)}
      {...props}
    >
      {/* A sliver stays visible for any value above zero. */}
      <div
        className="h-full rounded-full bg-primary"
        style={{ width: `${value > 0 ? Math.max(pct, 1) : 0}%` }}
      />
    </div>
  );
};

type SegProps = Omit<ComponentProps<"button">, "children"> & {
  // Any scale, segments share the width by their values.
  value: number;
  // Shown in the tooltip.
  label: string;
};

const Seg = ({ value, label, className, style, ...props }: SegProps) => (
  <Tooltip>
    <TooltipTrigger
      data-slot="meter-seg"
      className={cn("h-full min-w-0 rounded-sm bg-primary", className)}
      style={{ ...style, flexGrow: Math.max(value, 0), flexBasis: 0 }}
      {...props}
    />
    <TooltipContent>
      <p>{label}</p>
    </TooltipContent>
  </Tooltip>
);

export const Meter = Object.assign(Root, { Seg });
