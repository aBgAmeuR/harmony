import { defineSeriesChild, type SeriesConfig } from "./chart-child";

export interface LineProps {
  /** Key in data to use for y values */
  dataKey: string;
  /** Stroke color. Default: var(--chart-1) */
  stroke?: string;
  /** Stroke width. Default: 2 */
  strokeWidth?: number;
  /** Series label for tooltip. Default: dataKey */
  label?: string;
}

function toSeriesConfig(props: LineProps): SeriesConfig {
  return {
    dataKey: props.dataKey,
    label: props.label ?? props.dataKey,
    stroke: props.stroke,
    strokeWidth: props.strokeWidth,
  };
}

export const Line = defineSeriesChild(
  function Line(_props: LineProps) {
    return null;
  },
  "line",
  toSeriesConfig,
);

Line.displayName = "Line";

export default Line;
