import { AppHeader } from "~/components/app-header";
import { SelectTimeRange } from "~/components/select-time-range";
import { SelectTopLayout } from "~/components/select-top-layout";

import { TopArtistList } from "../components/top-artists-list";

export default function TopArtistsPage() {
  return (
    <>
      <AppHeader items={["Stats", "Top", "Artists"]}>
        <SelectTimeRange />
        <SelectTopLayout />
      </AppHeader>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <TopArtistList />
      </div>
    </>
  );
}
