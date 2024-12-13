import React, { Suspense } from "react";

import { getTopArtistsAction } from "~/actions/get-top-user-action";
import { AppHeader } from "~/components/app-header";
import { ListSkeleton } from "~/components/list-skeleton";
import { SelectTimeRange } from "~/components/select-time-range";
import { SelectTimeRangeInfo } from "~/components/select-time-range-info";
import { SelectTopLayout } from "~/components/select-top-layout";
import { getCookieTopTimeRange } from "~/lib/utils-server";

import { TopArtistList } from "../components/top-artists-list";

export default function TopArtistsPage() {
  return (
    <>
      <AppHeader items={["Stats", "Top", "Artists"]}>
        <SelectTimeRangeInfo />
        <SelectTimeRange />
        <SelectTopLayout />
      </AppHeader>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Suspense fallback={<ListSkeleton />}>
          <TopArtistListWrapper />
        </Suspense>
      </div>
    </>
  );
}

const TopArtistListWrapper = async () => {
  const timeRange = await getCookieTopTimeRange();
  const initalData = await getTopArtistsAction(timeRange);

  return <TopArtistList initalData={initalData} />;
};
