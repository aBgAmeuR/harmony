import { AppHeader } from "~/components/app-header";
import { SelectMonthRange } from "~/components/select-month-range";

import {
  DaysHabitChartWrapper,
  HoursHabitChartWrapper,
  ShuffleHabitChartWrapper,
  SkippedHabitChartWrapper,
  TopPlatformChartWrapper,
} from "./components/chart-wrappers";
import { StatCard } from "./components/stat-card";

export default async function StatsListeningHabitsPage() {
  return (
    <>
      <AppHeader items={["Package", "Stats", "Listening Habits"]}>
        <SelectMonthRange />
      </AppHeader>
      <main className="flex flex-col lg:flex-row p-4 gap-4 max-w-6xl w-full mx-auto">
        <div className="flex flex-col flex-1 gap-4">
          <StatCard
            title="Listening Hours"
            description="Time spent listening to music"
            skeletonClassName="aspect-video w-full"
          >
            <HoursHabitChartWrapper />
          </StatCard>
          <StatCard
            title="Listening Days"
            description="Days you listened to music"
            skeletonClassName="aspect-video w-full"
          >
            <DaysHabitChartWrapper />
          </StatCard>
        </div>
        <div className="flex justify-center flex-wrap md:justify-start lg:flex-nowrap lg:flex-col gap-4">
          <StatCard
            title="Top Platforms"
            description="Most used platforms"
            skeletonClassName="h-[240px] w-[240px]"
          >
            <TopPlatformChartWrapper />
          </StatCard>
          <StatCard
            title="Shuffle Habits"
            description="Shuffle habits"
            skeletonClassName="h-[160px] w-[240px]"
          >
            <ShuffleHabitChartWrapper />
          </StatCard>
          <StatCard
            title="Skipped Tracks"
            description="Tracks you skipped"
            skeletonClassName="h-[160px] w-[240px]"
          >
            <SkippedHabitChartWrapper />
          </StatCard>
        </div>
      </main>
    </>
  );
}
