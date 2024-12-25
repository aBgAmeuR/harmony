import { Suspense } from "react";
import { auth } from "@repo/auth";

import { AppHeader } from "~/components/app-header";
import { SelectMonthRange } from "~/components/select-month-range";

import { getMonthlyData } from "../stats/activity/get-data";
import {
  TimeListenedChart,
  TimeListenedChartSkeleton,
} from "../stats/activity/time-listened-chart";
import { RankingList } from "./ranking-list";
import { TopStatsCards } from "./top-stats-cards";

export default function OverviewPage() {
  return (
    <>
      <AppHeader items={["Package", "Overview"]}>
        <SelectMonthRange />
      </AppHeader>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-2 max-w-screen-2xl w-full mx-auto">
        <TopStatsCards
          activeListeners={0}
          totalArtists={0}
          totalPlaytime={0}
          totalTracks={0}
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Suspense
            fallback={<TimeListenedChartSkeleton className="col-span-2" />}
          >
            <TimeListenedChartWrapper />
          </Suspense>
          <div className="col-span-1"></div>
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

  return <TimeListenedChart data={data} className="col-span-2" />;
};
