import uPlot from "uplot";

export type AreaFillPattern = "dots";

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

const DOT_SPACING_CSS = 6;
const DOT_RADIUS_CSS = 1.25;
const DOT_TOP_OPACITY = 0.75;

function createAreaGradient(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  y1: number,
  colorToken: string,
  topOpacity: number,
  resolveColor: (token: string) => string,
): CanvasGradient | string {
  const stroke = resolveColor(colorToken);
  const topColor = withAlpha(stroke, topOpacity, "0.841 0.183 145.593");
  const bottomColor = withAlpha(stroke, 0, "0.841 0.183 145.593");

  if (!Number.isFinite(x0) || !Number.isFinite(y0) || !Number.isFinite(y1) || y1 <= y0) {
    return topColor;
  }

  const gradient = ctx.createLinearGradient(x0, y0, x0, y1);
  gradient.addColorStop(0, topColor);
  gradient.addColorStop(1, bottomColor);
  return gradient;
}

function paintDotMask(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  spacing: number,
  radius: number,
): void {
  const tile = document.createElement("canvas");
  tile.width = spacing;
  tile.height = spacing;
  const tileCtx = tile.getContext("2d");
  if (!tileCtx) {
    return;
  }

  tileCtx.fillStyle = "#fff";
  tileCtx.beginPath();
  tileCtx.arc(spacing / 2, spacing / 2, radius, 0, Math.PI * 2);
  tileCtx.fill();

  const pattern = ctx.createPattern(tile, "repeat");
  if (!pattern) {
    return;
  }

  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = "source-over";
}

function canBakePatternFill(left: number, top: number, width: number, height: number): boolean {
  return (
    Number.isFinite(left) &&
    Number.isFinite(top) &&
    Number.isFinite(width) &&
    Number.isFinite(height) &&
    width >= 1 &&
    height >= 1
  );
}

/**
 * Area fill: vertical gradient, optionally with a dotted overlay that uses the same gradient.
 * When a pattern is requested, both layers are baked into one CanvasPattern so the series
 * stroke still draws on top.
 */
export function chartAreaFill(
  u: uPlot,
  colorToken: string,
  topOpacity = 0.4,
  pattern?: AreaFillPattern,
): CanvasGradient | CanvasPattern | string {
  const { left, top, width, height } = u.bbox;
  const bottom = top + height;
  const resolveColor = (token: string) => chartColor(u, token);
  const gradientFill = () =>
    createAreaGradient(u.ctx, left, top, bottom, colorToken, topOpacity, resolveColor);

  if (!pattern || !canBakePatternFill(left, top, width, height)) {
    return gradientFill();
  }

  const canvasWidth = Math.max(1, Math.ceil(width));
  const canvasHeight = Math.max(1, Math.ceil(height));

  const pxRatio = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const spacing = Math.max(4, Math.round(DOT_SPACING_CSS * pxRatio));
  const radius = Math.max(0.75, DOT_RADIUS_CSS * pxRatio);

  const offscreen = document.createElement("canvas");
  offscreen.width = canvasWidth;
  offscreen.height = canvasHeight;
  const offCtx = offscreen.getContext("2d");
  if (!offCtx || offscreen.width === 0 || offscreen.height === 0) {
    return gradientFill();
  }

  // Layer 1 — soft area gradient (same as default fill)
  const baseFill = createAreaGradient(
    offCtx,
    0,
    0,
    canvasHeight,
    colorToken,
    topOpacity,
    resolveColor,
  );
  offCtx.fillStyle = baseFill;
  offCtx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Layer 2 — denser gradient punched into dots, composited on top
  if (pattern === "dots") {
    const dots = document.createElement("canvas");
    dots.width = canvasWidth;
    dots.height = canvasHeight;
    const dotsCtx = dots.getContext("2d");
    if (dotsCtx && dots.width > 0 && dots.height > 0) {
      const dotsFill = createAreaGradient(
        dotsCtx,
        0,
        0,
        canvasHeight,
        colorToken,
        DOT_TOP_OPACITY,
        resolveColor,
      );
      dotsCtx.fillStyle = dotsFill;
      dotsCtx.fillRect(0, 0, canvasWidth, canvasHeight);
      paintDotMask(dotsCtx, canvasWidth, canvasHeight, spacing, radius);
      offCtx.drawImage(dots, 0, 0);
    }
  }

  const fillPattern = u.ctx.createPattern(offscreen, "no-repeat");
  if (!fillPattern) {
    return gradientFill();
  }

  // Align the baked fill with the plot bbox (uPlot fills in canvas pixel space)
  fillPattern.setTransform(new DOMMatrix().translateSelf(left, top));
  return fillPattern;
}
