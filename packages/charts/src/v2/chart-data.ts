import uPlot from "uplot";

export function formatXLabel(value: unknown): string {
  if (value instanceof Date) {
    return value.toLocaleString("en-US", { month: "short", year: "numeric" });
  }
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return value == null ? "" : JSON.stringify(value);
}

export function toChartData(
  data: Record<string, unknown>[],
  xDataKey: string,
  dataKeys: readonly string[],
): { chartData: uPlot.AlignedData; labels: string[] } {
  const labels = data.map((row) => formatXLabel(row[xDataKey]));
  const xs = data.map((_, index) => index);
  const ys = dataKeys.map((dataKey) =>
    data.map((row) => {
      const value = row[dataKey];
      return typeof value === "number" ? value : null;
    }),
  );

  return {
    chartData: [xs, ...ys],
    labels,
  };
}
