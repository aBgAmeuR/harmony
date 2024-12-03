import { Suspense } from "react";

import { getDaysHabitAction } from "~/actions/get-days-habit-action";
import { getHoursHabitAction } from "~/actions/get-hours-habit-action";
import { getTopPlatformsAction } from "~/actions/get-top-platforms-action";
import { AppHeader } from "~/components/app-header";
import { SelectMonthRange } from "~/components/select-month-range";
import { addMonths, getCookieRankingTimeRange } from "~/lib/utils-server";

import { DaysHabitChart } from "./days-habit-chart";
import { HoursHabitChart } from "./hours-habit-chart";
import { TopPlatformChart } from "./top-platform-chart";

export default async function StatsListeningHabitsPage() {
  const dates = await getCookieRankingTimeRange();

  return (
    <>
      <AppHeader items={["Package", "Stats", "Listening Habits"]}>
        <SelectMonthRange />
      </AppHeader>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Suspense fallback={null}>
          <StatsHoursHabitChart dates={dates} />
        </Suspense>
        <Suspense fallback={null}>
          <StatsDaysHabitChart dates={dates} />
        </Suspense>
        <Suspense fallback={null}>
          <StatsTopPlatformChart dates={dates} />
        </Suspense>
      </div>
    </>
  );
}

const StatsHoursHabitChart = async ({
  dates,
}: {
  dates: Awaited<ReturnType<typeof getCookieRankingTimeRange>>;
}) => {
  const initialData = await getHoursHabitAction(
    dates.dateStart,
    addMonths(dates.dateEnd, 1),
  );

  return <HoursHabitChart initialData={initialData} />;
};

const StatsDaysHabitChart = async ({
  dates,
}: {
  dates: Awaited<ReturnType<typeof getCookieRankingTimeRange>>;
}) => {
  const initialData = await getDaysHabitAction(
    dates.dateStart,
    addMonths(dates.dateEnd, 1),
  );

  return <DaysHabitChart initialData={initialData} />;
};

const StatsTopPlatformChart = async ({
  dates,
}: {
  dates: Awaited<ReturnType<typeof getCookieRankingTimeRange>>;
}) => {
  const initialData = await getTopPlatformsAction(
    dates.dateStart,
    addMonths(dates.dateEnd, 1),
  );

  return <TopPlatformChart initialData={initialData} />;
};
