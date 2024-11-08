import { TopTracksList } from "../components/top-tracks-list";

import { AppHeader } from "@/components/app-header";
import { SelectTimeRange } from "@/components/select-time-range";

export default async function TopTracksPage() {
  return (
    <>
      <AppHeader items={["Stats", "Top", "Tracks"]}>
        <SelectTimeRange />
      </AppHeader>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <TopTracksList />
      </div>
    </>
  );
}
