import { AppHeader } from "~/components/app-header";

export default async function TopTracksPage() {
  return (
    <>
      <AppHeader items={["Stats", "Top", "Tracks"]}>
        {/* <SelectTimeRange /> */}
        {/* <SelectTopLayout /> */}
      </AppHeader>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* <TopTracksList /> */}
      </div>
    </>
  );
}
