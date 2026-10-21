import {
  Chart,
  barY,
  chartBase,
  columnBand,
  columnTooltip,
  defineChart,
  xBand,
  yValue,
} from "@harmony/charts/v4";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { seriesOf } from "@/shared/lib/chart-series";

import { listeningQueries } from "./api";

const SERIES = seriesOf("streams");

export const ReleaseYearWidget = () => {
  const { data } = useQuery(listeningQueries.releaseYear.queryOptions());

  const definition = useMemo(
    () =>
      defineChart({
        ...chartBase,
        marks: [
          barY(data ?? [], { id: "bars", x: "name", y: "value", z: () => "streams", radius: 2 }),
          columnBand(),
        ],
        scales: { x: xBand(), y: { ...yValue(), axis: false } },
        ...columnTooltip(SERIES),
      }),
    [data],
  );

  return (
    <div className="flex flex-col">
      <div className="flex justify-between px-4 pt-3">
        <span className="text-xs text-muted-foreground">Release Year</span>
      </div>
      <div className="px-2">
        <Chart definition={definition} ariaLabel="Streams by release year" aspectRatio={4} />
      </div>
    </div>
  );
};
