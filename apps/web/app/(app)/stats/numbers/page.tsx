import { getNumbersSessionStatsAction } from "~/actions/get-numbers-session-stats-action";
import { getNumbersStatsAction } from "~/actions/get-numbers-stats-actions";
import { AppHeader } from "~/components/app-header";
import { addMonths, getCookieRankingTimeRange } from "~/lib/utils-server";

export default async function StatsNumbersPage() {
  const dates = await getCookieRankingTimeRange();
  const dataSession = await getNumbersSessionStatsAction(
    dates.dateStart,
    addMonths(dates.dateEnd, 1),
  );
  const data = await getNumbersStatsAction(
    dates.dateStart,
    addMonths(dates.dateEnd, 1),
  );

  return (
    <>
      <AppHeader items={["Package", "Stats", "Activity"]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <pre>{JSON.stringify(dataSession, null, 2)}</pre>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </>
  );
}
