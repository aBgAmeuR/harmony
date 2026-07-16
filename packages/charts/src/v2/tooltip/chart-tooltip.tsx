import { defineFeatureChild } from "../chart-child";

export interface ChartTooltipProps {
  suffix?: string;
}

export const ChartTooltip = defineFeatureChild(
  function ChartTooltip(_props: ChartTooltipProps) {
    return null;
  },
  "tooltip",
  (props) => (props.suffix ? { suffix: props.suffix } : {}),
);

ChartTooltip.displayName = "ChartTooltip";

export default ChartTooltip;
