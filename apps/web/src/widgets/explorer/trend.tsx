import { useEffect, useRef, useState } from "react";

import type { ExplorerTrendPoint } from "@/data/explorer/trends";

import { Spark } from "@/shared/primitives/spark";

import type { ExplorerSort } from "./search";

export type TrendUnit = "day" | "month";

type TrendProps = {
  points: ExplorerTrendPoint[];
  sort: ExplorerSort;
};

const valueOf = (point: ExplorerTrendPoint, sort: ExplorerSort): number =>
  sort === "playtime" ? point.playtime : point.streams;

// Drawn once its row scrolls into view: drawing every row at once blocks the tab switch.
export const ExplorerTrend = ({ points, sort }: TrendProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) setSeen(true);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [seen]);

  return (
    <div ref={ref} className="h-7">
      {seen ? <Spark data={points.map((point) => valueOf(point, sort))} /> : null}
    </div>
  );
};
