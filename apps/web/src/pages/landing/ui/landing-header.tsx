import type { ComponentProps } from "react";

import { cn } from "@harmony/ui/lib/utils";
import { Link } from "@tanstack/react-router";

import { LandingLogo } from "./landing-logo";
import { COLUMN } from "./landing-section";
import { CHANGELOG_URL, DEMO_PACKAGE_ID, DOCS_URL, GITHUB_URL } from "./links";

const navLink = "rounded-sm text-muted-foreground/70 transition-colors hover:text-foreground";

const External = ({ className, ...props }: ComponentProps<"a">) => (
  <a target="_blank" rel="noopener noreferrer" className={cn(navLink, className)} {...props} />
);

export const LandingHeader = () => (
  <header className={cn(COLUMN, "flex flex-col gap-4")}>
    <Link to="/" aria-label="Harmony" className="group/logo w-fit rounded-md">
      <LandingLogo className="size-10" />
    </Link>
    <nav className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      <Link to="/" className="rounded-sm font-medium text-foreground">
        Harmony
      </Link>
      <Link to="/app/$packageId" params={{ packageId: DEMO_PACKAGE_ID }} className={navLink}>
        Demo
      </Link>
      <External href={DOCS_URL}>Docs</External>
      <External href={CHANGELOG_URL}>Changelog</External>
      <External href={GITHUB_URL}>GitHub</External>
    </nav>
  </header>
);
