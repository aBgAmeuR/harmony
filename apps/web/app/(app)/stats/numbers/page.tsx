import { getNumbersSessionStatsAction } from "~/actions/get-numbers-session-stats-action";
import { getNumbersStatsAction } from "~/actions/get-numbers-stats-actions";
import { AppHeader } from "~/components/app-header";
import { SelectMonthRange } from "~/components/select-month-range";
import { addMonths, getCookieRankingTimeRange } from "~/lib/utils-server";

import { NumbersStatsCards } from "./numbers-stats-cards";

export default async function StatsNumbersPage() {
  const dates = await getCookieRankingTimeRange();
  const dataSession = await getNumbersSessionStatsAction(
    dates.dateStart,
    addMonths(dates.dateEnd, 1),
  );

  return (
    <>
      <AppHeader items={["Package", "Stats", "Numbers"]}>
        <SelectMonthRange />
      </AppHeader>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <pre>{JSON.stringify(dataSession, null, 2)}</pre>
        <NumbersStatsCardsWrapper />
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
