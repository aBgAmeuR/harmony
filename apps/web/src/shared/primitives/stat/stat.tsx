import type { ComponentProps } from "react";

import { Metric } from "../metric";

const formatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

type StatProps = ComponentProps<typeof Metric> & {
  value?: number;
  unit?: string;
};

export const Stat = ({ value, unit, ...props }: StatProps) => (
  <Metric {...props}>
    <Metric.Value>{value ? formatter.format(value) : "-"}</Metric.Value>
    {unit && <Metric.Unit>{unit}</Metric.Unit>}
  </Metric>
);
