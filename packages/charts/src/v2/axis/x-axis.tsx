import { defineFeatureChild } from "../chart-child";
import { X_AXIS_GAP } from "./x-axis-plugin";

export interface XAxisProps {
  /** CSS px gap between the plot and x-axis labels. Default: 8 */
  gap?: number;
}

export const XAxis = defineFeatureChild(
  function XAxis(_props: XAxisProps) {
    return null;
  },
  "xAxis",
  (props) => ({
    gap: typeof props.gap === "number" && Number.isFinite(props.gap) ? props.gap : X_AXIS_GAP,
  }),
);

XAxis.displayName = "XAxis";

export default XAxis;
