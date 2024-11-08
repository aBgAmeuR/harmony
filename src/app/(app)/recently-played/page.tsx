import { Suspense } from "react";

import { TopListSkeleton } from "../top/components/top-list-skeleton";
import { RecentlyPlayedList } from "./components/recently-played-list";

import { AppHeader } from "@/components/app-header";

export default function RecentlyPlayedPage() {
  return (
    <>
      <AppHeader items={["Stats", "Recently Played"]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Suspense fallback={<TopListSkeleton layout="list" />}>
          <RecentlyPlayedList />
        </Suspense>
      </div>
    </>
  );
}
