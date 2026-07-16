export type SeriesKind = "bar" | "line" | "area";

export interface SeriesConfig {
  dataKey: string;
  label: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export type ChartFeatureRole = "grid" | "xAxis" | "tooltip";

export type SeriesChildDescriptor = {
  role: "series";
  kind: SeriesKind;
  extract: (props: unknown) => SeriesConfig | null;
};

export type FeatureChildDescriptor = {
  role: ChartFeatureRole;
  extract?: (props: unknown) => Record<string, unknown>;
};

export type ChartChildDescriptor = SeriesChildDescriptor | FeatureChildDescriptor;

export const CHART_CHILD = Symbol.for("harmony.chart.v2.child");

export type ChartChildComponent<P = unknown> = ((props: P) => null) & {
  [CHART_CHILD]: ChartChildDescriptor;
  displayName?: string;
};

export function defineSeriesChild<P extends { dataKey: string }>(
  render: (props: P) => null,
  kind: SeriesKind,
  extract: (props: P) => SeriesConfig,
): ChartChildComponent<P> {
  const descriptor: SeriesChildDescriptor = {
    role: "series",
    kind,
    extract: (props) => extract(props as P),
  };

  return Object.assign(render, { [CHART_CHILD]: descriptor });
}

export function defineFeatureChild<P>(
  render: (props: P) => null,
  role: ChartFeatureRole,
  extract?: (props: P) => Record<string, unknown>,
): ChartChildComponent<P> {
  const descriptor: FeatureChildDescriptor = extract
    ? { role, extract: (props) => extract(props as P) }
    : { role };

  return Object.assign(render, { [CHART_CHILD]: descriptor });
}

export function getChartChildDescriptor(type: unknown): ChartChildDescriptor | null {
  if (typeof type !== "function") {
    return null;
  }

  return (type as ChartChildComponent)[CHART_CHILD] ?? null;
}
