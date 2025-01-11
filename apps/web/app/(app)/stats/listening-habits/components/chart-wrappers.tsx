import { auth } from "@repo/auth";

import { isDemo } from "~/lib/utils-server";

import { DaysHabitChart } from "../days-habit-chart";
import {
  getDaysHabit,
  getHoursHabit,
  getShuffleHabit,
  getSkippedHabit,
  getTopPlatforms,
} from "../get-charts-data";
import { HoursHabitChart } from "../hours-habit-chart";
import { ShuffleHabitChart } from "../shuffle-habit-chart";
import { SkippedHabitChart } from "../skipped-habit-chart";
import { TopPlatformChart } from "../top-platform-chart";

const createChartWrapper = <T,>(
  // eslint-disable-next-line no-unused-vars
  fetchAction: (userId: string | undefined, isDemo: boolean) => Promise<T>,
  ChartComponent: React.ComponentType<{ data: T }>,
) => {
  return async () => {
    const session = await auth();
    const d = performance.now();
    const data = await fetchAction(session?.user?.id, isDemo(session));
    console.log(
      "fetchAction",
      fetchAction.name,
      Math.floor(performance.now() - d) + "ms",
    );
    return <ChartComponent data={data} />;
  };
};

export const HoursHabitChartWrapper = createChartWrapper(
  getHoursHabit,
  HoursHabitChart,
);

export const DaysHabitChartWrapper = createChartWrapper(
  getDaysHabit,
  DaysHabitChart,
);

export const TopPlatformChartWrapper = createChartWrapper(
  getTopPlatforms,
  TopPlatformChart,
);

export const ShuffleHabitChartWrapper = createChartWrapper(
  getShuffleHabit,
  ShuffleHabitChart,
);

export const SkippedHabitChartWrapper = createChartWrapper(
  getSkippedHabit,
  SkippedHabitChart,
);
