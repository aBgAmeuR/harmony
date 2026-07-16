import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import uPlot from "uplot";

import { TooltipContent } from "./tooltip-content";

function barHalfWidth(u: uPlot, idx: number, barCenter: number): number {
  const xs = u.data[0];
  const prev = xs[idx - 1];
  const next = xs[idx + 1];
  let colW = u.bbox.width;

  if (typeof prev === "number" && typeof next === "number") {
    colW = (u.valToPos(next, "x") - u.valToPos(prev, "x")) / 2;
  } else if (typeof next === "number") {
    colW = (u.valToPos(next, "x") - barCenter) * 2;
  } else if (typeof prev === "number") {
    colW = (barCenter - u.valToPos(prev, "x")) * 2;
  } else if (xs.length > 0) {
    colW = u.bbox.width / xs.length;
  }

  return colW / 2;
}

function tooltipAnchorX(u: uPlot, idx: number, mouseLeft: number): number {
  const xVal = u.data[0]?.[idx];
  if (typeof xVal !== "number") return mouseLeft;

  const barCenter = u.valToPos(xVal, "x");
  const halfBar = barHalfWidth(u, idx, barCenter);
  const inSnapZone = Math.abs(mouseLeft - barCenter) <= halfBar * 0.75;

  return inSnapZone ? barCenter : mouseLeft;
}

function placeTooltip(tip: HTMLDivElement, u: uPlot, left: number, top: number) {
  const x = u.bbox.left + left;
  const y = u.bbox.top + top;
  const pad = 4;
  const w = tip.offsetWidth;
  const h = tip.offsetHeight;
  let l = x - w / 2;
  l = Math.max(pad, Math.min(l, u.width - w - pad));
  let t = y + pad;
  if (t + h > u.height - pad) t = y - pad - h;
  t = Math.max(pad, Math.min(t, u.height - h - pad));
  tip.style.left = `${l}px`;
  tip.style.top = `${t}px`;
}

export interface TooltipPluginOptions {
  labels: readonly string[];
  seriesLabel: string;
  resolveColor: (u: uPlot) => string;
  suffix?: string;
}

export function createTooltipPlugin({
  labels,
  seriesLabel,
  resolveColor,
  suffix,
}: TooltipPluginOptions): uPlot.Plugin {
  let tip: HTMLDivElement | null = null;
  let root: Root | null = null;

  return {
    hooks: {
      init(u) {
        tip = document.createElement("div");
        tip.style.cssText =
          "position:absolute;z-index:10;display:none;pointer-events:none;transition:left 100ms ease-out,top 100ms ease-out";
        u.root.appendChild(tip);
        root = createRoot(tip);

        u.over.onmouseenter = () => {
          u.over.style.cursor = "crosshair";
          if (tip) tip.style.display = "block";
        };
        u.over.onmouseleave = () => {
          u.over.style.cursor = "";
          if (tip) tip.style.display = "none";
        };
      },
      setCursor(u) {
        if (!tip || !root) return;

        const { left, top, idx } = u.cursor;
        if (idx == null) {
          tip.style.display = "none";
          return;
        }

        const title = labels[idx] ?? "";
        const value = u.data[1]?.[idx];
        const color = resolveColor(u);

        flushSync(() => {
          root?.render(
            <TooltipContent
              rows={[{ color, label: seriesLabel, value: value ?? "" }]}
              suffix={suffix}
              title={title}
            />,
          );
        });

        tip.style.display = "block";
        const anchorX = tooltipAnchorX(u, idx, left ?? 0);
        placeTooltip(tip, u, anchorX, top ?? 0);
      },
      destroy() {
        const currentRoot = root;
        const currentTip = tip;
        root = null;
        tip = null;
        setTimeout(() => {
          currentRoot?.unmount();
          currentTip?.remove();
        }, 0);
      },
    },
  };
}
