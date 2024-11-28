import { Suspense } from "react";

import { getMinMaxDateRangeAction } from "~/actions/get-min-max-date-range-action";
import { getRankingTracksAction } from "~/actions/get-ranking-tracks-action";
import { AppHeader } from "~/components/app-header";

import { RankList } from "../components/rank-list";

export default function RankingsTracksPage() {
  return (
    <>
      <AppHeader items={["Package", "Rankings", "Tracks"]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Suspense fallback={<div>Loading...</div>}>
          <RankTracksList />
        </Suspense>
      </div>
    </>
  );
}

const RankTracksList = async () => {
  const minMaxDates = await getMinMaxDateRangeAction();
  if (!minMaxDates) return null;

  const tracks = await getRankingTracksAction(
    minMaxDates.minDate,
    minMaxDates.maxDate,
  );
  if (!tracks) return null;

  return <RankList minMaxDates={minMaxDates} initialData={tracks} />;
};
