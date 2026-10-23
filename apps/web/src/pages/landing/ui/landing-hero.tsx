import { Button } from "@harmony/ui/components/button";
import { cn } from "@harmony/ui/lib/utils";
import { Link } from "@tanstack/react-router";

import { COLUMN, LandingSection } from "./landing-section";
import { DEMO_PACKAGE_ID } from "./links";

// Shown on first paint (no scroll reveal), so it stays in the prerendered page.
export const LandingHero = () => (
  <section className={cn("t-stagger is-shown", COLUMN)}>
    <h1 className="t-stagger-line t-stagger-line--1 text-xl font-semibold tracking-tight text-balance text-foreground">
      Your listening history, visualized
    </h1>
    <p className="t-stagger-line t-stagger-line--2 mt-2 max-w-lg text-sm text-pretty text-muted-foreground">
      Upload your Spotify <LandingSection.Em>Extended streaming history</LandingSection.Em> and look
      back on years of listening. No Spotify login
    </p>
    <div className="t-stagger-line t-stagger-line--3 mt-5 flex items-center gap-2">
      <Button nativeButton={false} size="lg" render={<Link to="/upload" />}>
        Upload my package
      </Button>
      <Button
        nativeButton={false}
        variant="ghost"
        size="lg"
        render={<Link to="/app/$packageId" params={{ packageId: DEMO_PACKAGE_ID }} />}
      >
        See the demo
      </Button>
    </div>
  </section>
);
