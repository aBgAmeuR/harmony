import { Suspense } from "react";

import { AppHeader } from "~/components/app-header";
import { ListSkeleton } from "~/components/list-skeleton";
import { MusicList } from "~/components/lists/music-list";

export default function RecentlyPlayedPage() {
  return (
    <>
      <AppHeader items={["Stats", "Recently Played"]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Suspense fallback={<ListSkeleton showRank={false} />}>
          <MusicList type="recentlyPlayed" />
        </Suspense>
      </div>
    </>
  );
}
