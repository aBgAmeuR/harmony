import { Suspense } from "react";

import { getRankingAlbumsAction } from "~/actions/get-ranking-albums-action";
import { AppHeader } from "~/components/app-header";
import { SelectMonthRange } from "~/components/select-month-range";
import { addMonths, getCookieRankingTimeRange } from "~/lib/utils-server";

import { RankList } from "../components/ranking-list";
import { SkeletonRankList } from "../components/skeleton-rank-list";

export default function RankingsAlbumsPage() {
  return (
    <>
      <AppHeader items={["Package", "Rankings", "Albums"]}>
        <SelectMonthRange />
      </AppHeader>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Suspense fallback={<SkeletonRankList />}>
          <AlbumsRankList />
        </Suspense>
      </div>
    </>
  );
}

const AlbumsRankList = async () => {
  const dates = await getCookieRankingTimeRange();
  const initialData = await getRankingAlbumsAction(
    dates.dateStart,
    addMonths(dates.dateEnd, 1),
  );

  return <RankList type="albums" initialData={initialData} />;
};
