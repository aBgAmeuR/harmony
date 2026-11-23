import type { ComponentProps } from "react";

import { cn } from "@harmony/ui/lib/utils";
import { Link } from "@tanstack/react-router";

import { LandingLogo } from "./landing-logo";
import { CHANGELOG_URL, DEMO_PACKAGE_ID, DOCS_URL, GITHUB_URL } from "./links";

const External = ({ className, ...props }: ComponentProps<"a">) => (
  <a
    target="_blank"
    rel="noopener noreferrer"
    className={cn(
      "rounded-sm py-2 text-muted-foreground/70 transition-colors hover:text-foreground",
      className,
    )}
    {...props}
  />
);

export const LandingHeader = () => (
  <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 pt-7">
    <Link
      to="/"
      className="group/logo flex items-center gap-2 rounded-md text-xl font-bold tracking-tight text-foreground"
    >
      <LandingLogo className="size-7" />
      Harmony
    </Link>
    <nav className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
      <Link
        to="/app/$packageId"
        params={{ packageId: DEMO_PACKAGE_ID }}
        className="rounded-sm py-2 text-muted-foreground/70 transition-colors hover:text-foreground"
      >
        Demo
      </Link>
      <External href={DOCS_URL}>Docs</External>
      <External href={CHANGELOG_URL}>Changelog</External>
      <External href={GITHUB_URL}>GitHub</External>
    </nav>
  </header>
);
