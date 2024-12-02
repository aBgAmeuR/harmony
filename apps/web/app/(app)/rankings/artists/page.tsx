import { Suspense } from "react";

import { getMinMaxDateRangeAction } from "~/actions/get-min-max-date-range-action";
import { AppHeader } from "~/components/app-header";

import { ArtistsRankList } from "../components/artists-rank-list";

export default function RankingsArtistsPage() {
  return (
    <>
      <AppHeader items={["Package", "Rankings", "Artists"]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Suspense fallback={<div>Loading...</div>}>
          <RankArtistsList />
        </Suspense>
      </div>
    </>
  );
}

const RankArtistsList = async () => {
  const minMaxDates = await getMinMaxDateRangeAction();
  if (!minMaxDates) return null;

  return <ArtistsRankList minMaxDates={minMaxDates} />;
};
