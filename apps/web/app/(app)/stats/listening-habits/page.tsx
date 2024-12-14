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
      <main className="flex-1 p-4 space-y-4 max-w-7xl w-full mx-auto">
        <div className="grid gap-4 lg:grid-cols-2">
          <StatCard
            title="Listening Hours"
            description="Time spent listening to music"
          >
            <HoursHabitChartWrapper />
          </StatCard>
          <StatCard
            title="Listening Days"
            description="Days you listened to music"
          >
            <DaysHabitChartWrapper />
          </StatCard>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Top Platforms" description="Most used platforms">
            <TopPlatformChartWrapper />
          </StatCard>
          <StatCard title="Shuffle Habits" description="Shuffle habits">
            <ShuffleHabitChartWrapper />
          </StatCard>
          <StatCard title="Skipped Tracks" description="Tracks you skipped">
            <SkippedHabitChartWrapper />
          </StatCard>
        </div>
      </main>
    </>
  );
}
