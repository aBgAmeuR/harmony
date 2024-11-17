import { AppHeader } from "~/components/app-header";
import { SelectTimeRange } from "~/components/select-time-range";
import { SelectTopLayout } from "~/components/select-top-layout";

import { TopTracksList } from "../components/top-tracks-list";

export default async function TopTracksPage() {
  return (
    <>
      <AppHeader items={["Stats", "Top", "Tracks"]}>
        <SelectTimeRange />
        <SelectTopLayout />
      </AppHeader>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <TopTracksList />
      </div>
    </>
  );
}
