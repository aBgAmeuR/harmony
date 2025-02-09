import { cn } from "@repo/ui/lib/utils";

import { MusicItemCardAction as Action } from "./action";
import { MusicItemCardContent as Content } from "./content";
import { MusicItemCardImage as Image } from "./image";
import { MusicItemCardRank as Rank } from "./rank";
import { MusicItemCardStats as Stats } from "./stats";
import { MusicItemCardProps as Props } from "./type";

export const MusicItemCard = ({
  item,
  rank,
  showAction,
  actionHref,
  layout = "list",
}: Props) => {
  return (
    <article
      className={cn(
        "flex @container",
        layout === "grid"
          ? "flex-col items-start space-y-4"
          : "items-center space-x-2 py-4 sm:space-x-4"
      )}
    >
      {layout === "grid" ? (
        <>
          <Image
            src={item.image}
            alt={item.name}
            href={item.href}
            layout={layout}
          />
          <Content item={item} />
          <Stats stat1={item.stat1} stat2={item.stat2} layout={layout} />
        </>
      ) : (
        <>
          {rank && <Rank rank={rank} />}
          <Image
            src={item.image}
            alt={item.name}
            href={item.href}
            layout={layout}
          />
          <Content item={item} />
          <Stats stat1={item.stat1} stat2={item.stat2} layout={layout} />
          {showAction && <Action href={actionHref} />}
        </>
      )}
    </article>
  );
};
