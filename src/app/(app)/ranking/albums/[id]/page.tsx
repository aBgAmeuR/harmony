import { MainNavigation } from "@/components/main-navigation";
import { ShadowEffect } from "@/components/ui/shadow-effect";
import dynamic from "next/dynamic";

const DetailsPage = dynamic(() => import('../../_components/detail-page'), { ssr: false })

export default function Home({ params }: { params: { id: string } }) {
  return (
    <main className="flex flex-col">
      <MainNavigation currentPath="/ranking/artists" redirect="/ranking/albums" showSecondaryNav />
      <DetailsPage type="albums" id={params.id} />
      <ShadowEffect />
    </main>
  );
}
