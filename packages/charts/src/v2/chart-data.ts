import uPlot from "uplot";

export function formatXLabel(value: unknown): string {
  if (value instanceof Date) {
    return value.toLocaleString("en-US", { month: "short", year: "numeric" });
  }
  return String(value ?? "");
}

export function toChartData(
  data: Record<string, unknown>[],
  xDataKey: string,
  dataKey: string,
): { chartData: uPlot.AlignedData; labels: string[] } {
  const labels = data.map((row) => formatXLabel(row[xDataKey]));
  const values = data.map((row) => {
    const value = row[dataKey];
    return typeof value === "number" ? value : null;
  });

  return {
    chartData: [data.map((_, index) => index), values],
    labels,
  };
}
