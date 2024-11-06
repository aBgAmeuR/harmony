import Balancer from "react-wrap-balancer";
import { ArrowRight } from "lucide-react";

import { Footer } from "@/components/footer";
import { Icons } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { auth, signIn, signOut } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="flex h-screen w-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <pre>{JSON.stringify(session, null, 2)}</pre>
          <div className="flex gap-2">
            <Icons.logo className="size-12 md:size-16" />
            <h1 className="text-5xl font-semibold tracking-tight md:text-7xl">
              Harmony
            </h1>
          </div>
          <Balancer className="max-w-3xl px-2 text-center text-muted-foreground md:text-balance md:text-xl">
            Harmony is a website that generates stats from your Spotify data
            Package. It is your device that processes the data, nothing is sent
            to any server!
          </Balancer>
        </div>
        <div className="flex gap-2">
          <ThemeToggle variant="outline" />

          <form
            action={async () => {
              "use server";
              await signIn("spotify");
            }}
          >
            <Button aria-label="Get Started">Get Started</Button>
          </form>
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <Button aria-label="Sign Out">Sign Out</Button>
          </form>
          <Button
            className="group"
            variant="ghost"
            aria-label="View on Github"
            asChild
          >
            <a href="https://github.com/aBgAmeuR/Harmony">
              Github
              <ArrowRight
                className="opacity-60 transition-transform group-hover:translate-x-0.5"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
            </a>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
