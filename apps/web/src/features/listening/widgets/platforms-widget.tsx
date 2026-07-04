import {
  Legend,
  LegendLabel,
  LegendMarker,
  LegendValue,
  LegendItem,
  PieChart,
  PieSlice,
  defaultPieColors,
  LegendItemData,
  PieData,
  PieCenter,
} from "@harmony/charts";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { query } from "@/lib/query";

function toLegendItems(data: PieData[]): LegendItemData[] {
  return data.map((d, index) => ({
    label: d.label,
    value: d.value,
    color: defaultPieColors[index % defaultPieColors.length] ?? "",
  }));
}

export function PlatformsWidget() {
  const { data = [] } = useQuery(query.listeningHabits.platforms.queryOptions());

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const legendItems = toLegendItems(data);

  return (
    <div className="flex flex-col">
      <div className="flex justify-between px-4 pt-3">
        <span className="text-xs text-muted-foreground">Platforms</span>
      </div>
      <div className="flex items-center gap-4 px-2">
        <div className="flex size-full items-center justify-center gap-8">
          <PieChart
            className="h-full w-1/2"
            innerRadius={55}
            data={data}
            hoveredIndex={hoveredIndex}
            onHoverChange={setHoveredIndex}
          >
            {data.map((_, index) => (
              <PieSlice index={index} key={index} />
            ))}
            <PieCenter defaultLabel="Platforms" />
          </PieChart>

          <Legend hoveredIndex={hoveredIndex} items={legendItems} onHoverChange={setHoveredIndex}>
            <LegendItem className="flex items-center gap-3">
              <LegendMarker />
              <LegendLabel className="flex-1" />
              <LegendValue formatValue={(value) => `${value.toLocaleString()} min`} />
            </LegendItem>
          </Legend>
        </div>
      </div>
    </div>
  );
}
