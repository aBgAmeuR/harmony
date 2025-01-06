import { Button } from "@repo/ui/button";
import { Github } from "lucide-react";
import Link from "next/link";

import { GetDemoBtn } from "../get-demo-btn";
import { ThemeToggle } from "../theme-toggle";
import { GetStartedBtn } from "./get-started-btn";

export const Footer = () => {
  const isMaintenance = process.env.APP_MAINTENANCE === "true";

  return (
    <footer className="w-full bg-background px-4 pt-4">
      <div className="mx-auto max-w-screen-xl">
        <div className="bg-background pb-4 text-foreground">
          <div className="flex flex-col items-center justify-between gap-4 border-t pt-4 text-xs text-muted-foreground sm:flex-col md:flex-row">
            <p>
              Built by{" "}
              <Button variant="link" className="p-0" asChild>
                <a href="https://github.com/aBgAmeuR">@aBgAmeuR</a>
              </Button>{" "}
              - <span className="text-muted-foreground">v2.3</span>
            </p>
            <div className="flex items-center gap-1">
              <GetStartedBtn variant="ghost" size="sm">
                Get Started
              </GetStartedBtn>
              {!isMaintenance ? (
                <GetDemoBtn
                  label="Get Demo"
                  variant="ghost"
                  size="sm"
                  className="px-3"
                />
              ) : null}
              <p className="mx-2">|</p>
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
          </div>
        </div>
      </div>
    </footer>
  );
};
