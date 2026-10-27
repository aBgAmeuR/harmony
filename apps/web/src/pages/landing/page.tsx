import { Suspense, lazy } from "react";

import { loadPages, serverPages } from "./preload";
import { LandingExport } from "./ui/landing-export";
import { LandingFaq } from "./ui/landing-faq";
import { LandingFooter } from "./ui/landing-footer";
import { LandingHeader } from "./ui/landing-header";
import { LandingHero } from "./ui/landing-hero";

const PAGES_ID = "landing-pages";

// Resolves once the element nears the viewport, or at once when it is not in the page.
const nearViewport = (id: string) =>
  new Promise<void>((resolve) => {
    const element = document.getElementById(id);
    if (!element) return resolve();
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        resolve();
      },
      { rootMargin: "50% 0px" },
    );
    observer.observe(element);
  });

const LazyPages = lazy(() => nearViewport(PAGES_ID).then(loadPages));

const LandingPages = () => {
  const Pages = serverPages.current ?? LazyPages;
  return <Pages />;
};

export const LandingPage = () => (
  <div className="min-h-svh min-w-0 bg-background font-sans text-foreground">
    <div className="mx-auto flex w-full max-w-4xl flex-col px-4 pt-14 pb-8 sm:pt-20">
      <LandingHeader />
      <main className="mt-6 mb-12 flex flex-col gap-24">
        <LandingHero />
        <LandingExport />
        <div id={PAGES_ID}>
          <Suspense>
            <LandingPages />
          </Suspense>
        </div>
        <LandingFaq />
      </main>
      <LandingFooter />
    </div>
  </div>
);
