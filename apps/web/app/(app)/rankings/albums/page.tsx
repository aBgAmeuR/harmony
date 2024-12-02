import { AppHeader } from "~/components/app-header";
import { SelectMonthRange } from "~/components/select-month-range";

import { RankList } from "../components/ranking-list";

export default function RankingsAlbumsPage() {
  return (
    <>
      <AppHeader items={["Package", "Rankings", "Albums"]}>
        <SelectMonthRange />
      </AppHeader>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <RankList type="albums" />
      </div>
    </>
  );
}
