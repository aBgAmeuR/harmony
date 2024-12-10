import { Suspense } from "react";

import { getNumbersSessionStatsAction } from "~/actions/get-numbers-session-stats-action";
import { getNumbersStatsAction } from "~/actions/get-numbers-stats-actions";
import { AppHeader } from "~/components/app-header";
import { SelectMonthRange } from "~/components/select-month-range";
import { addMonths, getCookieRankingTimeRange } from "~/lib/utils-server";

import { NumbersStatsCards } from "./numbers-stats-cards";
import { NumbersStatsSessionCard } from "./numbers-stats-sessions-card";

export default function StatsNumbersPage() {
  return (
    <>
      <AppHeader items={["Package", "Stats", "Numbers"]}>
        <SelectMonthRange />
      </AppHeader>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Suspense fallback={null}>
          <NumbersStatsCardsWrapper />
        </Suspense>
        <Suspense fallback={null}>
          <NumbersStatsSessionCardsWrapper />
        </Suspense>
      </div>
    </>
  );
}

const NumbersStatsCardsWrapper = async () => {
  const dates = await getCookieRankingTimeRange();
  const initialData = await getNumbersStatsAction(
    dates.dateStart,
    addMonths(dates.dateEnd, 1),
  );

  return <NumbersStatsCards initialData={initialData} />;
};

const NumbersStatsSessionCardsWrapper = async () => {
  const dates = await getCookieRankingTimeRange();
  const initialData = await getNumbersSessionStatsAction(
    dates.dateStart,
    addMonths(dates.dateEnd, 1),
  );

  return <NumbersStatsSessionCard initialData={initialData} />;
};
