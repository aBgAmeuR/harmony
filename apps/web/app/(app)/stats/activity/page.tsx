import { Suspense } from "react";
import { auth } from "@repo/auth";

import { AppHeader } from "~/components/app-header";
import { SelectMonthRange } from "~/components/select-month-range";

import { FirstTimeEvolutionCharts } from "./first-time-evolution-charts";
import {
  getFirstTimeListenedData,
  getMonthlyData,
  getMonthlyPlatformData,
} from "./get-data";
import { PlatformUsageChart } from "./platform-usage-chart";
import {
  TimeListenedChart,
  TimeListenedChartSkeleton,
} from "./time-listened-chart";

export default async function StatsActivityPage() {
  return (
    <>
      <AppHeader items={["Package", "Stats", "Activity"]}>
        <SelectMonthRange />
      </AppHeader>
      <div className="flex flex-1 flex-col gap-4 p-4 max-w-6xl w-full mx-auto">
        {/* // Time listened over the months
        // Time listened over the months beetwen platforms
        // Evolution of first time / discover listened tracks / artists / albums */}
        <Suspense fallback={<TimeListenedChartSkeleton />}>
          <TimeListenedChartWrapper />
        </Suspense>
        <Suspense fallback={null}>
          <PlatformUsageChartWrapper />
        </Suspense>
        <Suspense fallback={null}>
          <FirstTimeEvolutionChartsWrapper />
        </Suspense>
      </div>
    </>
  );
}

const TimeListenedChartWrapper = async () => {
  const session = await auth();
  const startTime = performance.now();
  const data = await getMonthlyData(session?.user?.id);
  const endTime = performance.now();
  console.log(`getMonthlyData execution time: ${endTime - startTime}ms`);
  if (!data) return null;

  return <TimeListenedChart data={data} />;
};

const PlatformUsageChartWrapper = async () => {
  const session = await auth();
  const data = await getMonthlyPlatformData(session?.user?.id);
  if (!data) return null;

  return <PlatformUsageChart data={data} />;
};

const FirstTimeEvolutionChartsWrapper = async () => {
  const session = await auth();
  const data = await getFirstTimeListenedData(session?.user.id);
  if (!data) return null;

  return <FirstTimeEvolutionCharts data={data} />;
};
