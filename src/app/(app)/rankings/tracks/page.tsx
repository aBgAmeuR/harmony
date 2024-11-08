import { RankList } from "../components/rank-list";

import { AppHeader } from "@/components/app-header";

export default function RankingsTracksPage() {
  return (
    <>
      <AppHeader items={["Package", "Rankings", "Tracks"]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <RankList />
      </div>
    </>
  );
}
