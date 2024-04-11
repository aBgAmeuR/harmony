import { MainNavigation } from "@/components/main-navigation";

export default function Home() {

  return (
    <main className="flex flex-col min-h-screen">
      <MainNavigation currentPath="/settings" />
      <section></section>
      <footer></footer>
    </main>
  );
}
