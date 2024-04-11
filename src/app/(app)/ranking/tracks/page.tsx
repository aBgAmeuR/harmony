import { MainNavigation } from "@/components/main-navigation";
import dynamic from "next/dynamic";

const Tracks = dynamic(() => import('./_components/tracks'), { ssr: false })

export default function Home() {

  return (
    <main className="flex flex-col min-h-screen relative">
      <MainNavigation currentPath="/ranking/tracks" showSecondaryNav />
      <Tracks />
      <div className="fixed inset-x-0 bottom-0 h-8 z-10 bg-gradient-to-t from-secondary to-tertary"></div>
    </main>
  );
}
