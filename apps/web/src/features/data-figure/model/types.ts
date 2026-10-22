import type { IconSvgElement } from "@harmony/icons";

// One way to draw a figure, such as bars or a donut.
export type FigureView = {
  value: string;
  label: string;
  // Shown instead of the label, which then names the button.
  icon?: IconSvgElement;
};

export type FigureState = {
  view: string;
};
