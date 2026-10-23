import { LandingExport } from "./ui/landing-export";
import { LandingFaq } from "./ui/landing-faq";
import { LandingFooter } from "./ui/landing-footer";
import { LandingHeader } from "./ui/landing-header";
import { LandingHero } from "./ui/landing-hero";
import { LandingPages } from "./ui/landing-pages";

// Every block sits in one 512px column (COLUMN).
export const LandingPage = () => (
  <div className="min-h-svh min-w-0 bg-background font-sans text-foreground">
    <div className="mx-auto flex w-full max-w-4xl flex-col px-4 pt-14 pb-8 sm:pt-20">
      <LandingHeader />
      <main className="mt-6 mb-12 flex flex-col gap-24">
        <LandingHero />
        <LandingExport />
        <LandingPages />
        <LandingFaq />
      </main>
      <LandingFooter />
    </div>
  </div>
);
