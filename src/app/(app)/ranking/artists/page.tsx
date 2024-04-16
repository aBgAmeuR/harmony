import { MainNavigation } from "@/components/main-navigation";
import { ShadowEffect } from "@/components/ui/shadow-effect";
import dynamic from "next/dynamic";

const RankingList = dynamic(() => import('../_components/ranking-list'), { ssr: false })

export default function Home() {

  return (
    <main className="flex flex-col">
      <MainNavigation currentPath="/ranking/artists" showSecondaryNav />
      <RankingList type="artists" />
      <ShadowEffect />
    </main>
  );
}
