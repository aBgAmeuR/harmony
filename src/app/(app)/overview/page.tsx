import { MainNavigation } from "@/components/main-navigation";
import dynamic from "next/dynamic";

const UserOverview = dynamic(() => import('./user-overview'), { ssr: false })

export default function Home() {

  return (
    <main className="flex flex-col min-h-screen">
      <MainNavigation currentPath="/overview" showSecondaryNav />
      <UserOverview />
      <footer></footer>
    </main>
  );
}
