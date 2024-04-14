import { MainNavigation } from "@/components/main-navigation";
import dynamic from "next/dynamic";

const Settings = dynamic(() => import('./_components/settings'), { ssr: false })

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <MainNavigation currentPath="/settings" />
      <Settings />
    </main>
  );
}
