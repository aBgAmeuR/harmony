import { cn } from "@harmony/ui/lib/utils";

import { Cover } from "@/shared/primitives/cover";
import { Rank } from "@/shared/primitives/rank";
import { Stat } from "@/shared/primitives/stat";

import type { HeroEntityCard as HeroEntityCardData } from "./mock-data";

type HeroEntityCardProps = {
  card: HeroEntityCardData;
  className?: string;
};

export const HeroEntityCard = ({ card, className }: HeroEntityCardProps) => {
  return (
    <div
      className={cn(
        "flex min-w-60 origin-center scale-95 items-center gap-2 rounded-xl border border-border bg-card/95 px-2 py-1.5 backdrop-blur-md",
        "transition-[rotate,scale] duration-500",
        "hover:rotate-0",
        "focus-visible:rotate-0",
        className,
      )}
    >
      <Cover src={card.image} alt={card.name} size="md" />
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex min-h-9 min-w-0 flex-col justify-center">
          <p className="truncate text-sm font-medium">{card.name}</p>
          <p className="truncate text-xs text-muted-foreground">{card.subtitle}</p>
        </div>

        {card.rank ? <Rank n={card.rank} /> : <Stat value={card.metric} unit="min" size="sm" />}
      </div>
    </div>
  );
};
