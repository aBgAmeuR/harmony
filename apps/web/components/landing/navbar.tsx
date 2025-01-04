import { Button, buttonVariants } from "@repo/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { Github } from "lucide-react";
import Link from "next/link";

import { GetDemoBtn } from "../get-demo-btn";
// import Navigation from "@repo/ui/navigation";
import { Icons } from "../icons";
import { ThemeToggle } from "../theme-toggle";

export default function Navbar() {
  return (
    <header className="top-0 z-50 -mb-4 px-4 pb-4">
      <div className="fade-bottom absolute left-0 h-24 w-full"></div>
      <div className="relative mx-auto max-w-screen-xl">
        <nav className="flex items-center justify-between py-4">
          <nav className="flex items-center gap-4 justify-start">
            <a href="/" className="flex items-center gap-2 text-xl font-bold">
              <Icons.logo className="size-8" />
              Harmony
            </a>
            <div className="hidden sm:flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                aria-label="View on Github"
                asChild
              >
                <a href="https://github.com/aBgAmeuR/Harmony" target="_blank">
                  <Github />
                </a>
              </Button>
              <ThemeToggle />
            </div>
            {/* <Navigation /> */}
          </nav>
          <nav className="flex items-center gap-4 justify-end">
            <GetDemoBtn label="Get Demo" variant="link" />
            <Link
              href="/overview"
              className={cn(buttonVariants())}
              aria-label="Get Started"
              data-testid="get-started-btn"
            >
              <Icons.spotify />
              Get Started
            </Link>
          </nav>
        </nav>
      </div>
    </header>
  );
}
