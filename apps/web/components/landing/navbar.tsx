import { Button } from "@repo/ui/button";
import { Github } from "lucide-react";
import Link from "next/link";

import { GetDemoBtn } from "../get-demo-btn";
import { Icons } from "../icons";
import { ThemeToggle } from "../theme-toggle";
import { GetStartedBtn } from "./get-started-btn";

export const Navbar = () => {
  const isMaintenance = process.env.APP_MAINTENANCE === "true";

  return (
    <header className="top-0 z-50 -mb-4 px-4 pb-4">
      <div className="fade-bottom absolute left-0 h-24 w-full"></div>
      <div className="relative mx-auto max-w-screen-xl">
        <nav className="flex items-center justify-between py-4">
          <nav className="flex items-center gap-4 justify-start">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold"
            >
              <Icons.logo className="size-8" />
              Harmony
            </Link>
            <div className="hidden sm:flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                aria-label="View on Github"
                asChild
              >
                <Link
                  href="https://github.com/aBgAmeuR/Harmony"
                  target="_blank"
                >
                  <Github />
                </Link>
              </Button>
              <ThemeToggle />
            </div>
          </nav>
          <nav className="flex items-center gap-4 justify-end">
            {!isMaintenance ? (
              <GetDemoBtn label="Get Demo" variant="link" />
            ) : null}
            <GetStartedBtn>Get Started</GetStartedBtn>
          </nav>
        </nav>
      </div>
    </header>
  );
};
