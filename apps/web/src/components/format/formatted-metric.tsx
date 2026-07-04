import { cn } from "@harmony/ui/lib/utils";

const formatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

type FormattedMetricProps = {
  value?: number;
  unit?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

export const FormattedMetric = ({ value, unit, size = "md", className }: FormattedMetricProps) => {
  return (
    <span
      data-slot="formatted-metric"
      data-size={size}
      className={cn("group/formatted-metric flex items-baseline gap-0.5", className)}
    >
      <span
        className={cn(
          "text-md font-semibold",
          "group-data-[size=sm]/formatted-metric:text-sm group-data-[size=sm]/formatted-metric:font-medium",
          "group-data-[size=md]/formatted-metric:text-md group-data-[size=md]/formatted-metric:font-semibold",
          "group-data-[size=lg]/formatted-metric:text-lg group-data-[size=lg]/formatted-metric:font-semibold",
        )}
      >
        {value ? formatter.format(value) : "-"}
      </span>
      {unit && (
        <span className="text-md text-muted-foreground group-data-[size=sm]/formatted-metric:text-xs">
          {unit}
        </span>
      )}
    </span>
  );
};
