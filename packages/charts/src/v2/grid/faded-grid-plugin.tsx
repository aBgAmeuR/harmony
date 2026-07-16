import uPlot from "uplot";

const SVG_NS = "http://www.w3.org/2000/svg";

type AxisWithSplits = uPlot.Axis & {
  _show?: boolean;
  _splits?: number[];
};

function svgEl<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
  return el;
}

const GRID_DASH = "4 4";

export function fadedGridPlugin(): uPlot.Plugin {
  let svg: SVGSVGElement | null = null;
  let lines: SVGGElement | null = null;
  let maskRect: SVGRectElement | null = null;
  let maskId = "";

  return {
    hooks: {
      init(u) {
        maskId = `uplot-grid-fade-${u.root.id || crypto.randomUUID()}`;
        const gradientId = `${maskId}-gradient`;

        svg = svgEl("svg", { "aria-hidden": "true" });
        svg.style.cssText =
          "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible";

        const defs = svgEl("defs");
        const gradient = svgEl("linearGradient", {
          id: gradientId,
          x1: "0%",
          x2: "100%",
          y1: "0%",
          y2: "0%",
        });
        gradient.append(
          svgEl("stop", { offset: "0%", "stop-color": "white", "stop-opacity": "0" }),
          svgEl("stop", { offset: "10%", "stop-color": "white", "stop-opacity": "1" }),
          svgEl("stop", { offset: "90%", "stop-color": "white", "stop-opacity": "1" }),
          svgEl("stop", { offset: "100%", "stop-color": "white", "stop-opacity": "0" }),
        );

        const mask = svgEl("mask", { id: maskId });
        maskRect = svgEl("rect", { fill: `url(#${gradientId})` });
        mask.append(maskRect);
        defs.append(gradient, mask);

        lines = svgEl("g", { mask: `url(#${maskId})` });
        svg.append(defs, lines);
        u.under.insertBefore(svg, u.under.firstChild);
      },

      drawAxes(u) {
        if (!lines || !svg || !maskRect) return;

        const yAxis = u.axes[1] as AxisWithSplits | undefined;
        if (!yAxis?.show || !yAxis._show) {
          lines.replaceChildren();
          return;
        }

        const splits = yAxis._splits;
        if (!splits?.length) {
          lines.replaceChildren();
          return;
        }

        const { top, width, height } = u.bbox;
        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
        maskRect.setAttribute("width", String(width));
        maskRect.setAttribute("height", String(height));

        const fragment = document.createDocumentFragment();

        for (const split of splits) {
          const y = Math.round(u.valToPos(split, "y", true) - top);
          fragment.append(
            svgEl("line", {
              x1: "0",
              y1: String(y),
              x2: String(width),
              y2: String(y),
              stroke: "var(--chart-grid)",
              "stroke-width": "1",
              "stroke-dasharray": GRID_DASH,
            }),
          );
        }

        lines.replaceChildren(fragment);
      },

      destroy() {
        svg?.remove();
        svg = null;
        lines = null;
        maskRect = null;
      },
    },
  };
}
