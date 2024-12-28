import { Suspense } from "react";
import { auth } from "@repo/auth";

import { AppHeader } from "~/components/app-header";
import { SelectMonthRange } from "~/components/select-month-range";

import { getMonthlyData } from "../stats/activity/get-data";
import {
  TimeListenedChart,
  TimeListenedChartSkeleton,
} from "../stats/activity/time-listened-chart";
import { getListeningPatternData } from "./get-listening-pattern-data";
import { ListeningPatternChart } from "./listening-pattern-chart";
import { RankingList } from "./ranking-list";
import { TopStatsCards, TopStatsCardsSkeleton } from "./top-stats-cards";

export default function OverviewPage() {
  return (
    <>
      <AppHeader items={["Package", "Overview"]}>
        <SelectMonthRange />
      </AppHeader>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-2 max-w-screen-2xl w-full mx-auto">
        <Suspense fallback={<TopStatsCardsSkeleton />}>
          <TopStatsCards />
        </Suspense>
        <div className="flex flex-col md:flex-row gap-4">
          <Suspense fallback={<TimeListenedChartSkeleton />}>
            <TimeListenedChartWrapper />
          </Suspense>
          <Suspense fallback={null}>
            <ListeningPatternChartWrapper />
          </Suspense>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <RankingList type="dashboardArtists" className="col-span-1" />
          <RankingList type="dashboardTracks" className="col-span-1" />
        </div>
      </div>
    </>
  );
}

const TimeListenedChartWrapper = async () => {
  const session = await auth();
  const data = await getMonthlyData(session?.user?.id);
  if (!data) return null;

  return <TimeListenedChart data={data} className="flex-1" />;
};

const ListeningPatternChartWrapper = async () => {
  const session = await auth();
  const data = await getListeningPatternData(session?.user?.id);
  if (!data) return null;

  return <ListeningPatternChart data={data} />;
};
