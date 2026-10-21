import {
  Chart,
  colors,
  defineChart,
  pie,
  polar,
  polarBase,
  radialArc,
  radialText,
  scaleLinear,
} from "@harmony/charts/v4";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import type { ListeningStyleMetric } from "@/data/listening/types";

import { listeningQueries } from "./api";

const GAUGE_SIZE = 132;

// A share out of 100 on a three-quarter arc, with its value and name in the middle.
const gauge = ({ label, value }: ListeningStyleMetric) => {
  const share = Math.max(0, Math.min(100, value));
  const parts = [
    { id: "share", value: share },
    { id: "rest", value: 100 - share },
  ];
  const center = [{ id: label, label, value: share }];

  return defineChart({
    ...polarBase,
    marks: [
      polar({
        radiusRatio: 0.9,
        scales: {
          angle: { scale: scaleLinear().domain([0, 1]) },
          radius: { scale: scaleLinear().domain([0, 1]) },
        },
        marks: [
          radialArc(
            pie(parts, { value: "value", startAngle: -Math.PI * 0.75, endAngle: Math.PI * 0.75 }),
            {
              id: "arc",
              key: "id",
              color: "id",
              innerRadius: ({ radius }) => radius * 0.8,
              cornerRadius: 999,
            },
          ),
          radialText(center, {
            id: "value",
            angle: 0,
            radius: 0,
            text: (row) => `${row.value}%`,
            fontSize: 20,
            fontWeight: 600,
          }),
          radialText(center, {
            id: "label",
            angle: 0,
            radius: 0,
            text: "label",
            dy: 18,
            fontSize: 11,
            fill: colors.muted,
          }),
        ],
      }),
    ],
    color: { domain: ["share", "rest"], range: [colors.primary, "var(--muted)"] },
    pointer: false,
    keyboard: false,
    focusRing: false,
  });
};

export const ListeningStyleWidget = () => {
  const { data } = useQuery(listeningQueries.listeningStyle.queryOptions());
  const gauges = useMemo(
    () => (data ?? []).map((metric) => ({ metric, definition: gauge(metric) })),
    [data],
  );

  return (
    <div className="flex flex-col">
      <div className="flex justify-between px-4 pt-3">
        <span className="text-xs text-muted-foreground">Listening Style</span>
      </div>
      <div className="grid grid-cols-2 gap-2 px-2">
        {gauges.map(({ metric, definition }) => (
          <div className="flex justify-center" key={metric.label}>
            <Chart
              definition={definition}
              ariaLabel={`${metric.label}: ${metric.value}%`}
              width={GAUGE_SIZE}
              height={GAUGE_SIZE}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
