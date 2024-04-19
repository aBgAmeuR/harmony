import { MainNavigation } from "@/components/main-navigation";
import { ShadowEffect } from "@/components/ui/shadow-effect";
import dynamic from "next/dynamic";
import { RankingListSelectorPhone } from "../_components/ranking-list-selector-phone";

const RankingList = dynamic(() => import('../_components/ranking-list'), { ssr: false })

export default function Home() {

  return (
    <main className="flex flex-col">
      <RankingListSelectorPhone currentPath="/ranking/albums" />
      <MainNavigation currentPath="/ranking/albums" showSecondaryNav />
      <RankingList type="albums" />
      <ShadowEffect />
    </main>
  );
}
