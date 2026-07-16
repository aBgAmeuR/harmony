import { defineFeatureChild } from "../chart-child";

export interface XAxisProps {
  /** Reserved for future x-axis customization. */
}

export const XAxis = defineFeatureChild(function XAxis(_props: XAxisProps) {
  return null;
}, "xAxis");

XAxis.displayName = "XAxis";

export default XAxis;
