import type { ChartGradient } from "@tanstack/charts";

import { d3Curve } from "@tanstack/charts/d3/shape";
import { curveLinear, curveLinearClosed, curveMonotoneX } from "d3-shape";

import { harmonyTheme } from "./theme";

// Spread first into every `defineChart` spec: Harmony theme and plot clipping. The data tween
// comes from the motion renderer of `Chart`.
export const chartBase = {
  theme: harmonyTheme,
  clip: true,
} as const;

// Base of a polar chart (pie, donut, gauge, radar): the polar mark owns its own scales.
export const polarBase = {
  ...chartBase,
  scales: { x: null, y: null },
} as const;

const numbers = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

// Default number format of axes and tooltips.
export const formatNumber = (value: number): string => numbers.format(value);

export const curves = {
  linear: d3Curve(curveLinear),
  monotone: d3Curve(curveMonotoneX),
} as const;

// Curves of radial marks, which take the D3 factory itself.
export const radialCurves = { closed: curveLinearClosed } as const;

// Vertical fade under an area: declare it in `gradients`, paint with `fill: "url(#<id>)"`.
export const fadeGradient = (id: string, color: string): ChartGradient => ({
  id,
  x1: 0,
  y1: 1,
  x2: 0,
  y2: 0,
  stops: [
    { offset: 0, color, opacity: 0 },
    { offset: 1, color, opacity: 0.4 },
  ],
});
