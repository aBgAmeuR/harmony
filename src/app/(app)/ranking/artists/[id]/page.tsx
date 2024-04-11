import { MainNavigation } from "@/components/main-navigation";

export default function Home({ params }: { params: { id: string } }) {
  return (
    <main className="flex flex-col min-h-screen">
      <MainNavigation currentPath="/ranking/artists" showSecondaryNav />
    </main>
  );
}
