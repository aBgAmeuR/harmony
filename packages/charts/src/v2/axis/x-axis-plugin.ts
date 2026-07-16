import uPlot from "uplot";

const LABEL_AXIS_SIZE = 22;
const LABEL_FONT = "12px";
/** CSS px gap between chart content and x-axis labels. */
export const BAR_X_AXIS_GAP = 6;
/** Minimum horizontal whitespace (px) required between two adjacent labels. */
const MIN_LABEL_GAP = 10;
/** Whitespace (px) kept between a label and the canvas edge when clamped. */
const EDGE_PAD = 2;

type AxisLayout = uPlot.Axis & { _pos?: number };

function evenlySpaced(n: number, count: number): number[] {
  if (count >= n) {
    return Array.from({ length: n }, (_, i) => i);
  }
  if (count <= 1) {
    return [0];
  }
  const out: number[] = [];
  let prev = -1;
  for (let k = 0; k < count; k++) {
    const idx = Math.round((k * (n - 1)) / (count - 1));
    if (idx !== prev) {
      out.push(idx);
      prev = idx;
    }
  }
  return out;
}

type Placement = { idx: number; left: number; center: number };

function tryPlace(
  u: uPlot,
  indices: number[],
  widths: number[],
  areaLeft: number,
  areaRight: number,
): Placement[] | null {
  const placements: Placement[] = [];
  let prevRight = Number.NEGATIVE_INFINITY;

  for (const idx of indices) {
    const half = (widths[idx] ?? 0) / 2;
    let center = u.valToPos(idx, "x", true);

    if (center - half < areaLeft + EDGE_PAD) {
      center = areaLeft + EDGE_PAD + half;
    } else if (center + half > areaRight - EDGE_PAD) {
      center = areaRight - EDGE_PAD - half;
    }

    const left = center - half;
    if (left < prevRight + MIN_LABEL_GAP) {
      return null;
    }
    prevRight = center + half;
    placements.push({ idx, left, center });
  }

  return placements;
}

export function createYRangeWithBottomGap(): uPlot.Scale.Range {
  return (u: uPlot, min: number, max: number) => {
    const ymax = max ?? 1;
    const ymin = min ?? 0;
    const h = u.bbox.height;
    if (!h) return [ymin, ymax];
    const span = ymax - ymin || ymax;
    const pad = (span / h) * BAR_X_AXIS_GAP;
    return [ymin - pad, ymax];
  };
}

/** Vertical padding for compact sparklines so the stroke does not clip. */
export function createSparklineYRange(paddingRatio = 0.12): uPlot.Scale.Range {
  return (_u: uPlot, min: number, max: number) => {
    const ymax = max ?? 1;
    const ymin = min ?? 0;
    const span = ymax - ymin || ymax || 1;
    const pad = span * paddingRatio;
    return [ymin - pad, ymax + pad];
  };
}

export function createXAxis(): uPlot.Axis {
  return {
    show: true,
    size: LABEL_AXIS_SIZE + BAR_X_AXIS_GAP - 5,
    gap: BAR_X_AXIS_GAP,
    grid: { show: false },
    ticks: { show: false },
    border: { show: false },
    splits: () => [],
    values: () => [],
  };
}

export function createHiddenXAxis(): uPlot.Axis {
  return {
    show: false,
    size: 0,
    grid: { show: false },
    ticks: { show: false },
    border: { show: false },
    splits: () => [],
    values: () => [],
  };
}

export function xAxisLabelsPlugin(labels: readonly string[]): uPlot.Plugin {
  const n = labels.length;

  return {
    hooks: {
      drawAxes(u) {
        if (n === 0) return;
        const axis = u.axes[0] as AxisLayout | undefined;
        if (!axis?.show) return;

        const ctx = u.ctx;
        ctx.save();
        ctx.font = LABEL_FONT;

        const widths = labels.map((label) => ctx.measureText(label).width);
        const areaLeft = u.bbox.left;
        const areaRight = u.bbox.left + u.bbox.width;
        const available = areaRight - areaLeft;

        const widest = widths.reduce((m, w) => Math.max(m, w), 0);
        const maxFit = Math.max(
          1,
          Math.floor((available + MIN_LABEL_GAP) / (widest + MIN_LABEL_GAP)),
        );

        let placements: Placement[] | null = null;
        for (let count = Math.min(n, maxFit); count >= 1; count--) {
          placements = tryPlace(u, evenlySpaced(n, count), widths, areaLeft, areaRight);
          if (placements) break;
        }
        if (!placements) {
          ctx.restore();
          return;
        }

        const color = getComputedStyle(u.root).getPropertyValue("--chart-label").trim();
        const y = Math.round((axis._pos ?? u.height) + (axis.gap ?? BAR_X_AXIS_GAP));
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        for (const { idx, center } of placements) {
          ctx.fillText(labels[idx] ?? "", Math.round(center), y);
        }

        ctx.restore();
      },
    },
  };
}

export function createHiddenYAxis(): uPlot.Axis {
  return {
    show: true,
    size: 0,
    ticks: { show: false },
    border: { show: false },
    values: () => [],
    grid: { show: false },
  };
}
