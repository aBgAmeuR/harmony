import { AppHeader } from "@/components/app-header";
import { getUserTopItems } from "@/lib/spotify";
import { Track } from "@/types/spotify";

export default async function TopTracksPage() {
  const tracks = await getUserTopItems<Track[]>({
    type: "tracks",
    time_range: "short_term"
  });
  return (
    <>
      <AppHeader items={["Stats", "Top", "Tracks"]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <pre>{JSON.stringify(tracks, null, 2)}</pre>
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
        </div>
        <div className="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
    </>
  );
}
