import { defineSeriesChild, type SeriesConfig } from "./chart-child";

export interface BarProps {
  /** Key in data to use for y values */
  dataKey: string;
  /** Fill color for the bar. Default: var(--chart-1) */
  fill?: string;
  /** Color for tooltip dot. Default: uses fill */
  stroke?: string;
  /** Series label for tooltip. Default: dataKey */
  label?: string;
}

function toSeriesConfig(props: BarProps): SeriesConfig {
  return {
    dataKey: props.dataKey,
    label: props.label ?? props.dataKey,
    fill: props.fill,
    stroke: props.stroke ?? props.fill,
  };
}

export const Bar = defineSeriesChild(
  function Bar(_props: BarProps) {
    return null;
  },
  "bar",
  toSeriesConfig,
);

Bar.displayName = "Bar";

export default Bar;
