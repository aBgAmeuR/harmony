import { Suspense } from "react";

import { getRankingArtistsAction } from "~/actions/get-ranking-artists-action";
import { AppHeader } from "~/components/app-header";
import { SelectMonthRange } from "~/components/select-month-range";
import { addMonths, getCookieRankingTimeRange } from "~/lib/utils-server";

import { RankList } from "../components/ranking-list";
import { SkeletonRankList } from "../components/skeleton-rank-list";

export default function RankingsArtistsPage() {
  return (
    <>
      <AppHeader items={["Package", "Rankings", "Artists"]}>
        <SelectMonthRange />
      </AppHeader>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Suspense fallback={<SkeletonRankList />}>
          <ArtistsRankList />
        </Suspense>
      </div>
    </>
  );
}

const ArtistsRankList = async () => {
  const dates = await getCookieRankingTimeRange();
  const initialData = await getRankingArtistsAction(
    dates.dateStart,
    addMonths(dates.dateEnd, 1),
  );

  return <RankList type="artists" initialData={initialData} />;
};
