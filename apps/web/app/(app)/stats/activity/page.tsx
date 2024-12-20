import { Suspense } from "react";
import { auth } from "@repo/auth";

import { AppHeader } from "~/components/app-header";
import { SelectMonthRange } from "~/components/select-month-range";

import {
  FirstTimeEvolutionCharts,
  FirstTimeEvolutionChartsSkeleton,
} from "./first-time-evolution-charts";
import {
  getFirstTimeListenedData,
  getMonthlyData,
  getMonthlyPlatformData,
} from "./get-data";
import {
  PlatformUsageChart,
  PlatformUsageChartSkeleton,
} from "./platform-usage-chart";
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
        <Suspense fallback={<TimeListenedChartSkeleton />}>
          <TimeListenedChartWrapper />
        </Suspense>
        <Suspense fallback={<PlatformUsageChartSkeleton />}>
          <PlatformUsageChartWrapper />
        </Suspense>
        <Suspense fallback={<FirstTimeEvolutionChartsSkeleton />}>
          <FirstTimeEvolutionChartsWrapper />
        </Suspense>
      </div>
    </>
  );
}

const TimeListenedChartWrapper = async () => {
  const session = await auth();
  const data = await getMonthlyData(session?.user?.id);
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
