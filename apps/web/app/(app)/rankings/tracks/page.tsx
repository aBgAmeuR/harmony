import { Suspense } from "react";

import { getRankingTracksAction } from "~/actions/get-ranking-tracks-action";
import { AppHeader } from "~/components/app-header";
import { SelectMonthRange } from "~/components/select-month-range";
import { addMonths, getCookieRankingTimeRange } from "~/lib/utils-server";

import { RankList } from "../components/ranking-list";
import { SkeletonRankList } from "../components/skeleton-rank-list";

export default function RankingsTracksPage() {
  return (
    <>
      <AppHeader items={["Package", "Rankings", "Tracks"]}>
        <SelectMonthRange />
      </AppHeader>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Suspense fallback={<SkeletonRankList />}>
          <TracksRankList />
        </Suspense>
      </div>
    </>
  );
}

const TracksRankList = async () => {
  const dates = await getCookieRankingTimeRange();
  const initialData = await getRankingTracksAction(
    dates.dateStart,
    addMonths(dates.dateEnd, 1),
  );

  return <RankList type="tracks" initialData={initialData} />;
};
