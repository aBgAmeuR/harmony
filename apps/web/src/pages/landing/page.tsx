import { LandingExport } from "./ui/landing-export";
import { LandingFaq } from "./ui/landing-faq";
import { LandingFooter } from "./ui/landing-footer";
import { LandingHeader } from "./ui/landing-header";
import { LandingHero } from "./ui/landing-hero";

export const LandingPage = () => (
  <div className="min-h-svh min-w-0 bg-background font-sans text-foreground">
    <div className="mx-auto flex min-h-svh w-full max-w-4xl flex-col px-4 sm:px-6">
      <LandingHeader />
      <LandingHero />
      <main className="flex flex-col gap-22 pt-22 pb-26">
        <LandingExport />
        <LandingFaq />
      </main>
      <LandingFooter />
    </div>
  </div>
);
