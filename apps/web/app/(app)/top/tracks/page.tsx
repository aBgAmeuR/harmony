import React, { Suspense } from "react";

import { getTopTracksAction } from "~/actions/get-top-user-action";
import { AppHeader } from "~/components/app-header";
import { ListSkeleton } from "~/components/list-skeleton";
import { SelectTimeRange } from "~/components/select-time-range";
import { SelectTopLayout } from "~/components/select-top-layout";
import { getCookieTopTimeRange } from "~/lib/utils-server";

import { TopTracksList } from "../components/top-tracks-list";
export default async function TopTracksPage() {
  return (
    <>
      <AppHeader items={["Stats", "Top", "Tracks"]}>
        <SelectTimeRange />
        <SelectTopLayout />
      </AppHeader>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Suspense fallback={<ListSkeleton />}>
          <TopTracksListWrapper />
        </Suspense>
      </div>
    </>
  );
}

const TopTracksListWrapper = async () => {
  const timeRange = await getCookieTopTimeRange();
  const initalData = await getTopTracksAction(timeRange);

  return <TopTracksList initalData={initalData} />;
};
