import { cn } from "@harmony/ui/lib/utils";
import { useId } from "react";

export type CatalogTrendPoint = {
  date: Date;
  value: number;
};

type Point = { x: number; y: number };

const W = 168;
const H = 28;

function paths(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = span * 0.12;
  const y0 = min - pad;
  const y1 = max + pad;
  const last = values.length - 1;

  const pts: Point[] = values.map((v, i) => ({
    x: last === 0 ? W / 2 : (i / last) * W,
    y: (1 - (v - y0) / (y1 - y0)) * H,
  }));

  let line = `M${pts[0]!.x} ${pts[0]!.y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[i + 2] ?? p2;
    line += ` C${p1.x + (p2.x - p0.x) / 6} ${p1.y + (p2.y - p0.y) / 6}, ${p2.x - (p3.x - p1.x) / 6} ${p2.y - (p3.y - p1.y) / 6}, ${p2.x} ${p2.y}`;
  }

  const a = pts[0]!;
  const b = pts[pts.length - 1]!;
  return { line, area: `${line} L${b.x} ${H} L${a.x} ${H} Z` };
}

export function CatalogTrendSparkline({ trend, className }: { trend: CatalogTrendPoint[] | number[], className?: string }) {
  const id = useId();
  if (trend.length === 0) return null;

  const { line, area } = paths(trend.map((p) => typeof p === "number" ? p : p.value));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn("h-7 w-full", className)} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={0} y2={H}>
          <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.4} />
          <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0.1} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path
        d={line}
        fill="none"
        stroke="var(--chart-2)"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
