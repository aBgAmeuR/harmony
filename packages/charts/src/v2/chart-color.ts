import uPlot from "uplot";

export function chartColor(u: uPlot, token: string): string {
  return getComputedStyle(u.root).getPropertyValue(token).trim();
}

export function resolveSeriesColorToken(series: { fill?: string; stroke?: string }): string {
  const color = series.stroke ?? series.fill ?? "var(--chart-1)";
  if (color.startsWith("var(")) {
    return color.slice(4, -1).trim();
  }
  return color;
}

export function withAlpha(color: string, alpha: number, fallback: string): string {
  if (!color) return `oklch(${fallback} / ${alpha})`;
  if (color.includes("/")) {
    return color.replace(/\/\s*[\d.]+%?\s*\)/, ` / ${alpha})`);
  }
  if (color.startsWith("oklch(")) {
    return color.replace(/\)$/, ` / ${alpha})`);
  }
  return color;
}

export function chartAreaFill(
  u: uPlot,
  colorToken: string,
  topOpacity = 0.4,
): CanvasGradient | string {
  const stroke = chartColor(u, colorToken);
  const topColor = withAlpha(stroke, topOpacity, "0.841 0.183 145.593");
  const bottomColor = withAlpha(stroke, 0, "0.841 0.183 145.593");

  const { left, top, height } = u.bbox;
  const bottom = top + height;
  if (!Number.isFinite(left) || !Number.isFinite(top) || !Number.isFinite(bottom) || height <= 0) {
    return topColor;
  }

  const gradient = u.ctx.createLinearGradient(left, top, left, bottom);
  gradient.addColorStop(0, topColor);
  gradient.addColorStop(1, bottomColor);
  return gradient;
}
