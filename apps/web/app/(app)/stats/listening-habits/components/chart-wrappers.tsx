import { getDaysHabitAction } from "~/actions/get-days-habit-action";
import { getHoursHabitAction } from "~/actions/get-hours-habit-action";
import { getShuffleHabitAction } from "~/actions/get-shuffle-habit-action";
import { getSkippedHabitAction } from "~/actions/get-skipped-habit-action";
import { getTopPlatformsAction } from "~/actions/get-top-platforms-action";
import { addMonths } from "~/lib/utils-server";

import { DaysHabitChart } from "../days-habit-chart";
import { HoursHabitChart } from "../hours-habit-chart";
import { ShuffleHabitChart } from "../shuffle-habit-chart";
import { SkippedHabitChart } from "../skipped-habit-chart";
import { TopPlatformChart } from "../top-platform-chart";

type ChartWrapperProps = {
  dates: {
    dateStart: Date;
    dateEnd: Date;
  };
};

const createChartWrapper = <T,>(
  // eslint-disable-next-line no-unused-vars
  fetchAction: (start: Date, end: Date) => Promise<T>,
  ChartComponent: React.ComponentType<{ initialData: T }>,
) => {
  return async ({ dates }: ChartWrapperProps) => {
    const initialData = await fetchAction(
      dates.dateStart,
      addMonths(dates.dateEnd, 1),
    );
    return <ChartComponent initialData={initialData} />;
  };
};

export const HoursHabitChartWrapper = createChartWrapper(
  getHoursHabitAction,
  HoursHabitChart,
);

export const DaysHabitChartWrapper = createChartWrapper(
  getDaysHabitAction,
  DaysHabitChart,
);

export const TopPlatformChartWrapper = createChartWrapper(
  getTopPlatformsAction,
  TopPlatformChart,
);

export const ShuffleHabitChartWrapper = createChartWrapper(
  getShuffleHabitAction,
  ShuffleHabitChart,
);

export const SkippedHabitChartWrapper = createChartWrapper(
  getSkippedHabitAction,
  SkippedHabitChart,
);
