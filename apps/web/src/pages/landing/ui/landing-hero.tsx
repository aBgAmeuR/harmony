import { Button } from "@harmony/ui/components/button";
import { Link } from "@tanstack/react-router";

import { useUploadEnabled } from "@/features/upload/use-upload-enabled";

import { LandingSection } from "./landing-section";
import { DEMO_PACKAGE_ID } from "./links";

export const LandingHero = () => {
  const uploadEnabled = useUploadEnabled();

  return (
    <section className="t-stagger is-shown flex flex-col gap-14 pt-24">
      <div className="flex flex-col items-center gap-5 text-center">
        <h1 className="t-stagger-line t-stagger-line--1 text-4xl leading-none font-bold tracking-tighter text-balance text-foreground sm:text-6xl">
          Your listening history,
          <br />
          <span className="text-primary">visualized</span>
        </h1>
        <p className="t-stagger-line t-stagger-line--2 max-w-md text-base text-pretty text-muted-foreground/70">
          Upload your Spotify <LandingSection.Em>Extended streaming history</LandingSection.Em> and
          look back on years of listening. No Spotify login
        </p>
        <div className="t-stagger-line t-stagger-line--3 mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {uploadEnabled ? (
            <>
              <Button
                nativeButton={false}
                className="h-10 rounded-full px-5 text-sm"
                render={<Link to="/upload" />}
              >
                Upload my package
              </Button>
              <Link
                to="/app/$packageId"
                params={{ packageId: DEMO_PACKAGE_ID }}
                className="rounded-sm text-sm text-foreground underline decoration-foreground/30 underline-offset-5 transition-colors hover:decoration-foreground"
              >
                See the demo
              </Link>
            </>
          ) : (
            <Button
              nativeButton={false}
              className="h-10 rounded-full px-5 text-sm"
              render={<Link to="/app/$packageId" params={{ packageId: DEMO_PACKAGE_ID }} />}
            >
              See the demo
            </Button>
          )}
        </div>
      </div>
      <picture>
        <source
          media="(max-width: 639px)"
          srcSet="/landing/explorer-mobile-780.webp 780w, /landing/explorer-mobile-1170.webp 1170w"
          sizes="100vw"
          width={390}
          height={600}
        />
        <img
          src="/landing/explorer-1240.webp"
          srcSet="/landing/explorer-1240.webp 1240w, /landing/explorer-2480.webp 2480w"
          sizes="(min-width: 896px) 848px, 100vw"
          width={1240}
          height={780}
          fetchPriority="high"
          alt="Harmony's Explorer ranking tracks by time listened"
          className="t-stagger-line t-stagger-line--4 block w-full rounded-xl border border-foreground/10 bg-background"
        />
      </picture>
    </section>
  );
};
