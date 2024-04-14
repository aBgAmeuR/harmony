import { MainNavigation } from "@/components/main-navigation";
import dynamic from "next/dynamic";

const Stats = dynamic(() => import('./_components/stats'), { ssr: false })

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <MainNavigation currentPath="/stats" showSecondaryNav/>
      <Stats />
    </main>
  );
}
