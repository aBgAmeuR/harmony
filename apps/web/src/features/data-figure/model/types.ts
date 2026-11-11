import type { IconSvgElement } from "@harmony/icons";

export type FigureView = {
  value: string;
  label: string;
  icon?: IconSvgElement;
};

export type FigureState = {
  view: string;
};
