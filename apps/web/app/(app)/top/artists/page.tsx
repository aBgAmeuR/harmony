import { Suspense } from "react";

import { getTopArtistsAction } from "~/actions/get-top-user-action";
import { AppHeader } from "~/components/app-header";
import { SelectTimeRange } from "~/components/select-time-range";
import { SelectTopLayout } from "~/components/select-top-layout";
import { getCookieTopTimeRange } from "~/lib/utils-server";

import { TopArtistList } from "../components/top-artists-list";
import { TopListSkeleton } from "../components/top-list-skeleton";

export default function TopArtistsPage() {
  return (
    <>
      <AppHeader items={["Stats", "Top", "Artists"]}>
        <SelectTimeRange />
        <SelectTopLayout />
      </AppHeader>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Suspense fallback={<TopListSkeleton layout="list" />}>
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
