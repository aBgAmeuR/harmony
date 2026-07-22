/**
 * PROTOTYPE — three hero chrome styles (header + title/desc/CTA).
 * Same layout; different type, color, and control treatment.
 * Flip via ?variant=A|B|C. Chart/cards stay shared in LandingHero.
 */
import { Button } from "@harmony/ui/components/button";
import { Link } from "@tanstack/react-router";

import { Icons } from "@/components/icons";

export const HERO_STYLE_VARIANTS = [
  { key: "A", name: "Instrument" },
  { key: "B", name: "Telemetry" },
  { key: "C", name: "Signal" },
] as const;

export type HeroStyleVariantKey = (typeof HERO_STYLE_VARIANTS)[number]["key"];

const TITLE = (
  <>
    Your listening history,
    <br />
    visualized.
  </>
);

const DESCRIPTION =
  "Upload your Spotify Extended Streaming History and explore tracks, artists, and albums in a dense analytics dashboard.";

function HeaderShell({
  brandClassName,
  navClassName,
  linkVariant = "ghost",
  upload,
}: {
  brandClassName: string;
  navClassName?: string;
  linkVariant?: "ghost" | "link";
  upload: React.ReactNode;
}) {
  return (
    <header className="mx-auto flex w-full max-w-xl items-center justify-center gap-4 pt-12">
      <Link to="/" className="flex shrink-0 items-center gap-2">
        <Icons.logo className="size-7!" />
        <span className={brandClassName}>Harmony</span>
      </Link>

      <nav className="ml-auto flex items-center gap-1">
        <Button variant={linkVariant} className={navClassName}>
          Docs
        </Button>
        <Button variant={linkVariant} className={navClassName}>
          Changelog
        </Button>
        <Button variant={linkVariant} className={navClassName}>
          GitHub
        </Button>
        {upload}
      </nav>
    </header>
  );
}

/** A — Instrument: app-shell density, compact toolbar CTAs */
function HeaderInstrument() {
  return (
    <HeaderShell
      brandClassName="text-xl font-bold tracking-[-0.4px] text-foreground"
      upload={<Button>Upload</Button>}
    />
  );
}

function CopyInstrument() {
  return (
    <div className="flex max-w-2xl flex-col items-start gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-[1.75rem] leading-[1.1] font-bold tracking-[-0.4px] text-balance text-foreground">
          {TITLE}
        </h1>
        <p className="max-w-md text-xs leading-relaxed text-muted-foreground">{DESCRIPTION}</p>
      </div>

      <div className="flex gap-1">
        <Button>Upload my package</Button>
        <Button variant="outline">Demo</Button>
      </div>
    </div>
  );
}

/** B — Telemetry: micro eyebrow, report-scale title, ghost secondary */
function HeaderTelemetry() {
  return (
    <header className="mx-auto flex w-full max-w-xl items-center justify-center gap-4 border-b border-border pt-10 pb-3">
      <Link to="/" className="flex shrink-0 items-center gap-2">
        <Icons.logo className="size-6!" />
        <span className="text-sm font-semibold tracking-[-0.2px] text-foreground">Harmony</span>
      </Link>

      <nav className="ml-auto flex items-center gap-0.5">
        <Button variant="ghost" className="text-chart-tooltip-muted">
          Docs
        </Button>
        <Button variant="ghost" className="text-chart-tooltip-muted">
          Changelog
        </Button>
        <Button variant="ghost" className="text-chart-tooltip-muted">
          GitHub
        </Button>
        <Button>Upload</Button>
      </nav>
    </header>
  );
}

function CopyTelemetry() {
  return (
    <div className="flex max-w-2xl flex-col items-start gap-3">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-medium tracking-[0.08em] text-chart-tooltip-muted uppercase">
          Extended Streaming History
        </p>
        <h1 className="text-[1.375rem] leading-none font-bold tracking-[-0.3px] text-balance text-foreground">
          {TITLE}
        </h1>
        <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">{DESCRIPTION}</p>
      </div>

      <div className="flex gap-1">
        <Button>Upload my package</Button>
        <Button variant="ghost">Demo</Button>
      </div>
    </div>
  );
}

/** C — Signal: green emphasis on title line, single solid CTA + link */
function HeaderSignal() {
  return (
    <HeaderShell
      brandClassName="text-lg font-bold tracking-tight text-foreground"
      navClassName="text-muted-foreground"
      upload={<Button>Upload</Button>}
    />
  );
}

function CopySignal() {
  return (
    <div className="flex max-w-2xl flex-col items-start gap-4">
      <div className="flex flex-col gap-2.5">
        <h1 className="text-[1.625rem] leading-[1.12] font-bold tracking-[-0.35px] text-balance">
          <span className="text-foreground">Your listening history,</span>
          <br />
          <span className="text-primary">visualized.</span>
        </h1>
        <p className="max-w-md text-sm leading-snug text-muted-foreground">{DESCRIPTION}</p>
      </div>

      <div className="flex items-center gap-3">
        <Button>Upload my package</Button>
        <Button variant="link" className="h-7 px-0">
          Demo
        </Button>
      </div>
    </div>
  );
}

export function HeroStyleHeader({ variant }: { variant: HeroStyleVariantKey }) {
  switch (variant) {
    case "A":
      return <HeaderInstrument />;
    case "B":
      return <HeaderTelemetry />;
    case "C":
      return <HeaderSignal />;
  }
}

export function HeroStyleCopy({ variant }: { variant: HeroStyleVariantKey }) {
  switch (variant) {
    case "A":
      return <CopyInstrument />;
    case "B":
      return <CopyTelemetry />;
    case "C":
      return <CopySignal />;
  }
}
