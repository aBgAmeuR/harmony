import { chartCssVars, ChartTooltip, Grid, Line, LineChart } from "@harmony/charts";
import { Button } from "@harmony/ui/components/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@harmony/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@harmony/ui/components/table";
import { cn } from "@harmony/ui/lib/utils";
import { useMemo, useState } from "react";

import { BENCHMARK_ITERATIONS } from "@/lib/benchmark-query";
import { formatMs } from "@/lib/benchmark-stats";
import { type BenchmarkPhase, type BenchmarkResult, runBenchmark } from "@/lib/run-benchmark";

type BenchmarkStatus = "idle" | BenchmarkPhase;

function toChartData(runs: BenchmarkResult["runs"]) {
  return runs.map((run) => ({
    date: new Date(2020, 0, run.iteration),
    queryMs: run.queryMs,
    toArrayMs: run.toArrayMs,
  }));
}

function StatGroup({ label, stats }: { label: string; stats: BenchmarkResult["stats"]["query"] }) {
  return (
    <Card size="xs">
      <CardHeader className="px-3 pt-3">
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-3 px-3 pb-3">
        <div>
          <p className="text-xs text-muted-foreground">Min</p>
          <p className="font-mono text-sm tabular-nums">{formatMs(stats.min)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Median</p>
          <p className="font-mono text-sm tabular-nums">{formatMs(stats.median)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">P95</p>
          <p className="font-mono text-sm tabular-nums">{formatMs(stats.p95)}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }
  if (typeof value === "number") {
    return value.toLocaleString();
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "bigint") {
    return value.toLocaleString();
  }
  return JSON.stringify(value);
}

function ResultTable({ rows }: { rows: BenchmarkResult["firstResult"] }) {
  const columns = rows[0] ? Object.keys(rows[0]) : [];

  if (columns.length === 0) {
    return <p className="text-sm text-muted-foreground">No rows returned.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead
              key={column}
              className={cn(
                "max-w-48",
                typeof rows[0]?.[column] === "number" ? "text-right" : undefined,
              )}
            >
              <span className="block truncate" title={column}>
                {column}
              </span>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, index) => (
          <TableRow key={index}>
            {columns.map((column) => {
              const text = formatCellValue(row[column]);
              const isNumeric = typeof row[column] === "number";

              return (
                <TableCell
                  key={column}
                  className={cn("max-w-48", isNumeric ? "text-right" : undefined)}
                >
                  <span
                    className={cn("block truncate", isNumeric && "tabular-nums")}
                    title={text}
                  >
                    {text}
                  </span>
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function BenchmarkPanel() {
  const [status, setStatus] = useState<BenchmarkStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<BenchmarkResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isRunning = status === "warming-up" || status === "running";
  const chartData = useMemo(() => (result ? toChartData(result.runs) : []), [result]);

  const statusLabel =
    status === "warming-up"
      ? "Warming up…"
      : status === "running"
        ? `Run ${progress} / ${BENCHMARK_ITERATIONS}`
        : null;

  async function handleRun() {
    setError(null);
    setResult(null);
    setProgress(0);

    try {
      const benchmarkResult = await runBenchmark({
        onPhase: setStatus,
        onProgress: setProgress,
      });
      setResult(benchmarkResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Benchmark failed");
    } finally {
      setStatus("idle");
      setProgress(0);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" disabled={isRunning} onClick={() => void handleRun()}>
          Run benchmark
        </Button>
        {statusLabel ? <span className="text-sm text-muted-foreground">{statusLabel}</span> : null}
        {error ? <span className="text-sm text-destructive">{error}</span> : null}
      </div>

      {result ? (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            <StatGroup label="Query" stats={result.stats.query} />
            <StatGroup label="To array" stats={result.stats.toArray} />
          </div>

          <Card size="xs">
            <CardHeader className="px-3 pt-3">
              <CardTitle>Latency by iteration</CardTitle>
              <CardAction>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="size-2 shrink-0 rounded-full bg-chart-1" />
                    <span className="text-xs text-legend-foreground">Query</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-2 shrink-0 rounded-full bg-chart-2" />
                    <span className="text-xs text-legend-foreground">To array</span>
                  </div>
                </div>
              </CardAction>
            </CardHeader>
            <CardContent>
              <LineChart
                animationDuration={0}
                aspectRatio="3 / 1"
                data={chartData}
                margin={{ top: 12, right: 12, bottom: 40, left: 12 }}
                revealSignature={String(result.runs.length)}
                status="ready"
              >
                <Grid horizontal hideHorizontalEdgeLines />
                <Line
                  animate={false}
                  dataKey="queryMs"
                  fadeEdges={false}
                  stroke={chartCssVars.linePrimary}
                />
                <Line
                  animate={false}
                  dataKey="toArrayMs"
                  fadeEdges={false}
                  stroke={chartCssVars.lineSecondary}
                />
                <ChartTooltip
                  rows={(point) => [
                    {
                      color: chartCssVars.linePrimary,
                      label: "Query",
                      value: formatMs(Number(point.queryMs ?? 0)),
                    },
                    {
                      color: chartCssVars.lineSecondary,
                      label: "To array",
                      value: formatMs(Number(point.toArrayMs ?? 0)),
                    },
                  ]}
                />
              </LineChart>
            </CardContent>
          </Card>

          <Card size="xs">
            <CardHeader className="px-3 pt-3">
              <CardTitle>First iteration result</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultTable rows={result.firstResult} />
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
