import { MainNavigation } from "@/components/main-navigation";
import dynamic from "next/dynamic";

const Artists = dynamic(() => import('./_components/artists'), { ssr: false })

export default function Home() {

  return (
    <main className="flex flex-col min-h-screen">
      <MainNavigation currentPath="/ranking/artists" showSecondaryNav />
      <Artists />
      <div className="fixed inset-x-0 bottom-0 h-8 z-10 bg-gradient-to-t from-secondary to-tertary"></div>
    </main>
  );
}
