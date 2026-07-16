import { defineSeriesChild, type SeriesConfig } from "./chart-child";

export interface AreaProps {
  /** Key in data to use for y values */
  dataKey: string;
  /** Fill color for the area gradient. Default: var(--chart-1) */
  fill?: string;
  /** Stroke color for the line. Default: same as fill */
  stroke?: string;
  /** Stroke width. Default: 2 */
  strokeWidth?: number;
  /** Series label for tooltip. Default: dataKey */
  label?: string;
}

function toSeriesConfig(props: AreaProps): SeriesConfig {
  return {
    dataKey: props.dataKey,
    label: props.label ?? props.dataKey,
    fill: props.fill,
    stroke: props.stroke ?? props.fill,
    strokeWidth: props.strokeWidth,
  };
}

export const Area = defineSeriesChild(
  function Area(_props: AreaProps) {
    return null;
  },
  "area",
  toSeriesConfig,
);

Area.displayName = "Area";

export default Area;
