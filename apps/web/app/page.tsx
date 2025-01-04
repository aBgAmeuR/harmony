import Balancer from "react-wrap-balancer";
import { Button } from "@repo/ui/button";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "next-view-transitions";

import { GetDemoBtn } from "~/components/get-demo-btn";
import { Icons } from "~/components/icons";
import { Footer } from "~/components/landing/footer";
import { Hero } from "~/components/landing/hero";
import Navbar from "~/components/landing/navbar";
import { ThemeToggle } from "~/components/theme-toggle";

export default async function HomePage() {
  const isMaintenance = process.env.APP_MAINTENANCE === "true";

  return (
    <div className="flex h-screen w-screen flex-col">
      {/* <main className="flex flex-1 flex-col items-center justify-center gap-6">
        <div className="flex justify-center">
          {isMaintenance ? (
            <div className="inline-flex items-center gap-x-2 border text-sm p-1 pe-3 rounded-full transition">
              <span className="py-1.5 px-2.5 inline-flex justify-center items-center gap-x-2 rounded-full bg-muted-foreground/15 font-semibold text-sm">
                <AlertTriangle className="size-4" />
              </span>
              <span>This website is under maintenance</span>
            </div>
          ) : null}
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-2">
            <Icons.logo className="size-12 md:size-16" />
            <h1 className="text-5xl font-semibold tracking-tight md:text-7xl">
              Harmony
            </h1>
          </div>
          <Balancer className="max-w-3xl px-2 text-center text-muted-foreground md:text-balance md:text-xl">
            Harmony is a website that generates stats from your Spotify data
            Package.
          </Balancer>
        </div>
        <div className="flex gap-2 items-center flex-col">
          <div className="flex gap-2">
            <ThemeToggle variant="outline" />
            {isMaintenance ? (
              <Button
                aria-label="Disabled Get Started"
                disabled
                data-testid="get-started-btn"
              >
                <Icons.spotify />
                Get Started
              </Button>
            ) : (
              <Button
                aria-label="Get Started"
                asChild
                data-testid="get-started-btn"
              >
                <Link href="/overview">
                  <Icons.spotify />
                  Get Started
                </Link>
              </Button>
            )}
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
          {!isMaintenance ? <GetDemoBtn label="Get a demo of Harmony" /> : null}
        </div>
      </main> */}
      <Navbar />
      <Hero />
      <Footer />
    </div>
  );
}
