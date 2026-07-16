import type uPlot from "uplot";

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const DEFAULT_CHART_MARGIN: Margin = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

export function resolveMargin(margin?: Partial<Margin>): Margin {
  return { ...DEFAULT_CHART_MARGIN, ...margin };
}

export function marginToPadding(margin: Margin): uPlot.Padding {
  return [margin.top, margin.right, margin.bottom, margin.left];
}
