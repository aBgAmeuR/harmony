import { cn } from "@harmony/ui/lib/utils";

import { CatalogImage } from "@/components/catalog/catalog-image";

import type { HeroEntityCard as HeroEntityCardData } from "./mock-data";

import { getRankClassName } from "../catalog/catalog-table";
import { FormattedMetric } from "../format/formatted-metric";

type HeroEntityCardProps = {
  card: HeroEntityCardData;
  className?: string;
};

export function HeroEntityCard({ card, className }: HeroEntityCardProps) {
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
      <CatalogImage image={card.image} alt={card.name} size="md" className="rounded-sm" />
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex min-h-9 min-w-0 flex-col justify-center">
          <p className="truncate text-sm font-medium">{card.name}</p>
          <p className="truncate text-xs text-muted-foreground">{card.subtitle}</p>
        </div>

        {card.rank ? (
          <span
            className={`inline-flex h-5 min-w-5 items-center justify-center rounded-md text-xs font-medium ${getRankClassName(card.rank)}`}
          >
            {card.rank}
          </span>
        ) : (
          <FormattedMetric value={card.metric} unit="min" size="sm" />
        )}
      </div>
    </div>
  );
}
