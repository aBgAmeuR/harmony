import { MainNavigation } from "@/components/main-navigation";
import dynamic from "next/dynamic";

const DetailsTrack = dynamic(() => import('./details-track'), { ssr: false })

export default function Home({ params }: { params: { id: string } }) {
  return (
    <main className="flex flex-col min-h-screen">
      <MainNavigation currentPath="/ranking/artists" redirect="/ranking/tracks" showSecondaryNav />
      <DetailsTrack id={params.id} />
      <div className="fixed inset-x-0 bottom-0 h-8 z-10 bg-gradient-to-t from-secondary to-tertary"></div>
    </main>
  );
}
