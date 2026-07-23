import { Button } from "@harmony/ui/components/button";
import { Link } from "@tanstack/react-router";

import { LandingLogo } from "@/components/landing/landing-logo";

export function LandingHeader() {
  return (
    <header className="mx-auto flex h-11 w-full max-w-xl items-center gap-3 px-4 pt-8 sm:px-0">
      <Link to="/" className="group/logo flex shrink-0 items-center gap-1 outline-none">
        <LandingLogo />
        <span className="font-bold tracking-tight text-foreground">Harmony</span>
      </Link>

      <nav className="ml-auto flex items-center gap-0.5">
        <Button
          nativeButton={false}
          variant="ghost"
          className="text-muted-foreground hover:text-foreground"
          render={
            <a
              href="https://github.com/aBgAmeuR/Harmony#readme"
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          Docs
        </Button>
        <Button
          nativeButton={false}
          variant="ghost"
          className="text-muted-foreground hover:text-foreground"
          render={
            <a
              href="https://github.com/aBgAmeuR/Harmony/releases"
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          Changelog
        </Button>
        <Button
          nativeButton={false}
          variant="ghost"
          className="text-muted-foreground hover:text-foreground"
          render={
            <a
              href="https://github.com/aBgAmeuR/Harmony"
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          GitHub
        </Button>
        <Button variant="gradient">
          Upload
        </Button>
      </nav>
    </header>
  );
}
