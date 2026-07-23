import { createFileRoute } from "@tanstack/react-router";

import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";

export const Route = createFileRoute("/")({
  ssr: true,
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className="flex min-h-svh flex-col bg-background font-sans text-foreground">
      <LandingHeader />
      <main className="flex flex-1 flex-col overflow-visible">
        <LandingHero />
        <LandingHowItWorks />
        <LandingFeatures />
      </main>
      <LandingFooter />
    </div>
  );
}
