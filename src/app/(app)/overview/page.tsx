import { Logo } from "@/components/logo";
import { MainNavigation } from "@/components/main-navigation";
import { Text, Title } from "@mantine/core";
import Link from "next/link";

export default function Home() {

  return (
    <main className="flex flex-col min-h-screen">
      <MainNavigation currentPath="/overview" showSecondaryNav/>
      <section></section>
      <footer></footer>
    </main>
  );
}
