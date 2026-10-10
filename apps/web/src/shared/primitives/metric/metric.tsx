import type { ComponentProps } from "react";

import { cn } from "@harmony/ui/lib/utils";

type MetricProps = ComponentProps<"span"> & {
  size?: "xs" | "sm" | "md" | "lg";
};

const Root = ({ size = "md", className, ...props }: MetricProps) => (
  <span
    data-slot="metric"
    data-size={size}
    className={cn("group/metric flex items-baseline gap-0.5", className)}
    {...props}
  />
);

const Value = ({ className, ...props }: ComponentProps<"span">) => (
  <span
    data-slot="metric-value"
    className={cn(
      "group-data-[size=md]/metric:text-md text-xs font-medium group-data-[size=lg]/metric:text-lg group-data-[size=lg]/metric:font-semibold group-data-[size=md]/metric:font-semibold group-data-[size=sm]/metric:text-sm",
      className,
    )}
    {...props}
  />
);

const Unit = ({ className, ...props }: ComponentProps<"span">) => (
  <span
    data-slot="metric-unit"
    className={cn(
      "group-data-[size=lg]/metric:text-md text-xs text-muted-foreground group-data-[size=md]/metric:text-sm",
      className,
    )}
    {...props}
  />
);

export const Metric = Object.assign(Root, { Value, Unit });
