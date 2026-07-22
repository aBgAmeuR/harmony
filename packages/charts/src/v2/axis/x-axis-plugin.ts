import uPlot from "uplot";

/** CSS px between plot bottom and label text. */
export const X_AXIS_GAP = 8;
/** CSS px reserved for the label line. */
export const X_AXIS_LABEL_SIZE = 14;

/** Total CSS px band under the plot for a given label gap. */
export function xAxisBandHeight(gap: number = X_AXIS_GAP): number {
  return Math.max(0, gap) + X_AXIS_LABEL_SIZE;
}

const LABEL_FONT = `12px ${typeof CSS !== "undefined" && CSS.supports("font-family", "system-ui") ? "system-ui, sans-serif" : "sans-serif"}`;
/** Minimum horizontal whitespace (CSS px) between adjacent labels. */
const MIN_LABEL_GAP = 8;
/** Whitespace (CSS px) kept between a label and the plot edge when clamped. */
const EDGE_PAD = 2;

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

type Placement = { idx: number; center: number };

function tryPlace(
  centers: number[],
  indices: number[],
  widths: number[],
  areaLeft: number,
  areaRight: number,
): Placement[] | null {
  const placements: Placement[] = [];
  let prevRight = Number.NEGATIVE_INFINITY;

  for (const idx of indices) {
    const half = (widths[idx] ?? 0) / 2;
    let center = centers[idx] ?? 0;

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
    placements.push({ idx, center });
  }

  return placements;
}

function measureWidths(labels: readonly string[]): number[] {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return labels.map((label) => label.length * 7);
  }
  ctx.font = LABEL_FONT;
  return labels.map((label) => ctx.measureText(label).width);
}

export function createSparklineYRange(paddingRatio = 0.12): uPlot.Scale.Range {
  return (_u: uPlot, min: number, max: number) => {
    const ymax = max ?? 1;
    const ymin = min ?? 0;
    const span = ymax - ymin || ymax || 1;
    const pad = span * paddingRatio;
    return [ymin - pad, ymax + pad];
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

/**
 * Renders x-axis labels into a dedicated HTML band under the plot.
 * Keeps a stable CSS gap regardless of DPR or plot height.
 */
export function xAxisLabelsPlugin(
  labels: readonly string[],
  labelsEl: HTMLElement,
  gap: number = X_AXIS_GAP,
): uPlot.Plugin {
  const n = labels.length;
  const widths = measureWidths(labels);
  const labelGap = Math.max(0, gap);

  labelsEl.replaceChildren();
  labelsEl.style.boxSizing = "border-box";

  const nodes = labels.map((label) => {
    const span = document.createElement("span");
    span.textContent = label;
    span.setAttribute(
      "style",
      [
        "position:absolute",
        `top:${labelGap}px`,
        "left:0",
        "transform:translateX(-50%)",
        "font:12px system-ui,sans-serif",
        "line-height:14px",
        "white-space:nowrap",
        "color:var(--chart-label)",
        "pointer-events:none",
        "visibility:hidden",
      ].join(";"),
    );
    labelsEl.append(span);
    return span;
  });

  function sync(u: uPlot) {
    if (n === 0) return;

    const plotLeft = u.bbox.left / uPlot.pxRatio;
    const plotWidth = u.bbox.width / uPlot.pxRatio;
    const areaLeft = plotLeft;
    const areaRight = plotLeft + plotWidth;
    const available = plotWidth;

    const centers = labels.map((_, idx) => plotLeft + u.valToPos(idx, "x", false));

    const widest = widths.reduce((m, w) => Math.max(m, w), 0);
    const maxFit = Math.max(
      1,
      Math.floor((available + MIN_LABEL_GAP) / (Math.max(widest, 1) + MIN_LABEL_GAP)),
    );

    let placements: Placement[] | null = null;
    for (let count = Math.min(n, maxFit); count >= 1; count--) {
      placements = tryPlace(centers, evenlySpaced(n, count), widths, areaLeft, areaRight);
      if (placements) break;
    }

    const visible = new Set(placements?.map((p) => p.idx) ?? []);
    const centerByIdx = new Map(placements?.map((p) => [p.idx, p.center] as const) ?? []);

    for (let idx = 0; idx < n; idx++) {
      const node = nodes[idx];
      if (!node) continue;
      if (!visible.has(idx)) {
        node.style.visibility = "hidden";
        continue;
      }
      node.style.visibility = "visible";
      node.style.left = `${centerByIdx.get(idx) ?? centers[idx] ?? 0}px`;
    }
  }

  return {
    hooks: {
      setSize: [sync],
      ready: [sync],
      draw: [sync],
    },
  };
}
