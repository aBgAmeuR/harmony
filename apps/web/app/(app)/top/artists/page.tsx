import { AppHeader } from "~/components/app-header";

export default function TopArtistsPage() {
  return (
    <>
      <AppHeader items={["Stats", "Top", "Artists"]}>
        {/* <SelectTimeRange /> */}
        {/* <SelectTopLayout /> */}
      </AppHeader>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* <TopArtistList /> */}
      </div>
    </>
  );
}
