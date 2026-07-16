import { defineFeatureChild } from "../chart-child";

export interface GridProps {
  /** Reserved for future grid customization. */
}

export const Grid = defineFeatureChild(function Grid(_props: GridProps) {
  return null;
}, "grid");

Grid.displayName = "Grid";

export default Grid;
