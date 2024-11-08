import { TopArtistList } from "../components/top-artists-list";

import { AppHeader } from "@/components/app-header";
import { SelectTimeRange } from "@/components/select-time-range";

export default function TopArtistsPage() {
  return (
    <>
      <AppHeader items={["Stats", "Top", "Artists"]}>
        <SelectTimeRange />
      </AppHeader>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <TopArtistList />
      </div>
    </>
  );
}
