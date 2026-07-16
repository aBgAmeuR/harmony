export type PhaseStats = {
  min: number;
  median: number;
  p95: number;
};

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) {
    return 0;
  }

  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sorted[lower] ?? 0;
  }

  const weight = index - lower;
  return (sorted[lower] ?? 0) * (1 - weight) + (sorted[upper] ?? 0) * weight;
}

export function computePhaseStats(values: number[]): PhaseStats {
  if (values.length === 0) {
    return { min: 0, median: 0, p95: 0 };
  }

  const sorted = values.toSorted((a, b) => a - b);

  return {
    min: sorted[0] ?? 0,
    median: percentile(sorted, 50),
    p95: percentile(sorted, 95),
  };
}

export function formatMs(value: number): string {
  return `${value.toFixed(2)} ms`;
}
