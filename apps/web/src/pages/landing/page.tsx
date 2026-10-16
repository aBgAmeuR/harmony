import { LandingFeatures } from "./ui/landing-features";
import { LandingFooter } from "./ui/landing-footer";
import { LandingHeader } from "./ui/landing-header";
import { LandingHero } from "./ui/landing-hero";
import { LandingHowItWorks } from "./ui/landing-how-it-works";

export const LandingPage = () => {
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
};
