import Balancer from "react-wrap-balancer";
import { ArrowRight } from "lucide-react";

import { Icons } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex h-screen w-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-2">
            <Icons.logo className="size-12 md:size-16" />
            <h1 className="text-5xl font-semibold tracking-tight md:text-7xl">
              Harmony
            </h1>
          </div>
          <Balancer className="max-w-3xl text-center text-muted-foreground md:text-balance md:text-xl">
            Harmony is a website that generates stats from your Spotify data
            Package. It is your device that processes the data, nothing is sent
            to any server!
          </Balancer>
        </div>
        <div className="flex gap-2">
          <ThemeToggle variant="outline" />
          <Button aria-label="Get Started" disabled>
            Get Started
          </Button>
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
      <footer className="my-4">
        <p className="text-center">
          Built by{" "}
          <Button variant="link" className="p-0" asChild>
            <a href="https://github.com/aBgAmeuR">@aBgAmeuR</a>
          </Button>{" "}
          - <span className="text-muted-foreground">v2.0</span>
        </p>
      </footer>
    </div>
  );
}
