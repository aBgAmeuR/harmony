import { db } from "@harmony/duckdb";

import { BENCHMARK_ITERATIONS, BENCHMARK_SQL, PRE_BENCHMARK_QUERY } from "./benchmark-query";
import { computePhaseStats, type PhaseStats } from "./benchmark-stats";

export type BenchmarkRow = Record<string, unknown>;

export type BenchmarkRun = {
  iteration: number;
  queryMs: number;
  toArrayMs: number;
};

export type BenchmarkPhase = "idle" | "warming-up" | "running";

export type BenchmarkResult = {
  runs: BenchmarkRun[];
  firstResult: BenchmarkRow[];
  stats: {
    query: PhaseStats;
    toArray: PhaseStats;
  };
};

type RunBenchmarkOptions = {
  onPhase: (phase: BenchmarkPhase) => void;
  onProgress: (iteration: number) => void;
};

export async function runBenchmark({
  onPhase,
  onProgress,
}: RunBenchmarkOptions): Promise<BenchmarkResult> {
  onPhase("warming-up");
  if (PRE_BENCHMARK_QUERY.trim() !== "") {
    await db.queryBenchmark<BenchmarkRow>(PRE_BENCHMARK_QUERY);
  }

  const runs: BenchmarkRun[] = [];
  let firstResult: BenchmarkRow[] = [];

  onPhase("running");

  for (let iteration = 1; iteration <= BENCHMARK_ITERATIONS; iteration++) {
    onProgress(iteration);

    const { rows, queryMs, toArrayMs } = await db.queryBenchmark<BenchmarkRow>(BENCHMARK_SQL);

    if (iteration === 1) {
      firstResult = rows;
    }

    runs.push({ iteration, queryMs, toArrayMs });
  }

  return {
    runs,
    firstResult,
    stats: {
      query: computePhaseStats(runs.map((run) => run.queryMs)),
      toArray: computePhaseStats(runs.map((run) => run.toArrayMs)),
    },
  };
}
