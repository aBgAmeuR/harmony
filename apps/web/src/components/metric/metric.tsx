import { cn } from "@harmony/ui/lib/utils";

const formatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const valueClass = {
  xs: "text-xs font-medium",
  sm: "text-sm font-medium",
  md: "text-md font-semibold",
  lg: "text-lg font-semibold",
} as const;

const unitClass = {
  xs: "text-xs",
  sm: "text-xs",
  md: "text-sm",
  lg: "text-md",
} as const;

type MetricProps = {
  value?: number;
  unit?: string;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
};

export const Metric = ({ value, unit, size = "md", className }: MetricProps) => {
  return (
    <span
      data-slot="metric"
      data-size={size}
      className={cn("flex items-baseline gap-0.5", className)}
    >
      <span className={valueClass[size]}>{value ? formatter.format(value) : "-"}</span>
      {unit && <span className={"text-muted-foreground " + unitClass[size]}>{unit}</span>}
    </span>
  );
};
