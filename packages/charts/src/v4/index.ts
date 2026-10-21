// Native TanStack Charts API, unchanged.
export * from "./native";

// Harmony layer: the host, the theme and presets that are plain native option values.
export { Chart } from "./chart";
export { chartBase, curves, fadeGradient, formatNumber, polarBase, radialCurves } from "./base";
export { intensity, intensityColor, intensityLevel, intensityLevels } from "./intensity";
export { IntensityLegend } from "./intensity-legend";
export { gridAcross, gridDown, quietAxis, xBand, xPoint, yValue } from "./scales";
export {
  columnBand,
  columnGuide,
  columnTooltip,
  pointTooltip,
  seriesColor,
  tooltipBase,
  type Series,
} from "./series";
export { colors, focusDot, harmonyTheme } from "./theme";
