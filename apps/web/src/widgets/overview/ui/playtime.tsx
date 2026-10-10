import { cn } from "@harmony/ui/lib/utils";

import { playtimeParts } from "../format";

type PlaytimeProps = {
  minutes: number;
  className?: string;
};

// "51 h 12 min": values in the foreground color, units muted.
export const Playtime = ({ minutes, className }: PlaytimeProps) => (
  <span className={cn("inline-flex items-baseline gap-0.5", className)}>
    {playtimeParts(minutes).map(({ value, unit }) => (
      <span key={unit} className="inline-flex items-baseline">
        <span className="font-medium text-foreground">{value}</span>
        <span className="text-muted-foreground">{unit}</span>
      </span>
    ))}
  </span>
);
