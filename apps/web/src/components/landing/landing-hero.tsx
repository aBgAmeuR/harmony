import { Button } from "@harmony/ui/components/button";
import { cn } from "@harmony/ui/lib/utils";

import { HeroChart } from "./hero-chart";
import { HeroEntityCard } from "./hero-entity-card";
import { HERO_ENTITY_CARDS } from "./mock-data";

function WaveUnderline() {
  return (
    <svg
      aria-hidden
      className="block h-3 w-full origin-center -translate-y-0.5 overflow-visible text-primary transition-[color,scale] duration-300 ease-out group-hover/wave:scale-y-110 group-hover/wave:text-chart-1 group-focus-visible/wave:scale-y-115 group-focus-visible/wave:text-chart-1"
      viewBox="0 0 160 16"
      preserveAspectRatio="none"
    >
      <path
        d="M0 8 L6 5 L12 11 L18 4 L24 10 L30 6 L36 12 L42 3 L48 9 L54 5 L60 11 L66 4 L72 8 L78 6 L84 12 L90 3 L96 9 L102 5 L108 11 L114 4 L120 8 L126 6 L132 12 L138 3 L144 9 L150 5 L156 10 L160 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

const CARD_FLOAT = [
  "animate-[card-float_4.2s_ease-in-out_infinite]",
  "animate-[card-float_5.1s_ease-in-out_infinite] [animation-delay:0.6s]",
  "animate-[card-float_5.8s_ease-in-out_infinite] [animation-delay:1.1s]",
  "animate-[card-float_4.7s_ease-in-out_infinite] [animation-delay:1.8s]",
] as const;

export function LandingHero() {
  return (
    <>
      <section className="mx-auto mt-10 flex w-full max-w-xl flex-col px-4 sm:mt-14 sm:px-0">
        <div className="flex flex-col items-start gap-6">
          <div className="flex w-full flex-col gap-3">
            <h1 className="text-[2rem] leading-[1.15] font-bold tracking-tight text-balance text-foreground sm:text-4xl sm:leading-10">
              Your listening history,
              <br />
              <span className="inline-flex items-end gap-0">
                <span
                  className="group/wave inline-flex cursor-default flex-col overflow-visible outline-none"
                  tabIndex={0}
                >
                  visualized.
                  <WaveUnderline />
                </span>
              </span>
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Upload your Extended Streaming History and dive into years of tracks, artists, and
              albums.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button size="lg" variant="gradient">
              Upload my package
            </Button>
            <Button
              size="lg"
              variant="link"
              className="text-muted-foreground hover:text-foreground"
            >
              Get a demo
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 w-full max-w-5xl overflow-visible sm:mt-16">
        <div className="relative h-64 w-full overflow-visible">
          <HeroChart />

          <div className="absolute inset-0 z-20 mx-auto block max-w-2xl">
            {HERO_ENTITY_CARDS.map((card, index) => (
              <div
                key={card.name}
                className={cn(
                  "absolute motion-reduce:animate-none!",
                  card.positionClassName,
                  CARD_FLOAT[index] ?? CARD_FLOAT[0],
                )}
              >
                <HeroEntityCard card={card} className={card.rotateClassName} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
