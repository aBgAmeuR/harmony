import { MainNavigation } from "@/components/main-navigation";
import { ShadowEffect } from "@/components/ui/shadow-effect";
import dynamic from "next/dynamic";

const RankingList = dynamic(() => import('../_components/ranking-list'), { ssr: false })

export default function Home() {

  return (
    <main className="flex flex-col">
      <MainNavigation currentPath="/ranking/tracks" showSecondaryNav />
      <RankingList type="tracks" />
      <ShadowEffect />
    </main>
  );
}
