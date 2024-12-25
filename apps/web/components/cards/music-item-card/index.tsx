import { MusicItemCardAction as Action } from "./action";
import { MusicItemCardContent as Content } from "./content";
import { MusicItemCardImage as Image } from "./image";
import { MusicItemCardRank as Rank } from "./rank";
import { MusicItemCardStats as Stats } from "./stats";
import { MusicItemCardProps as Props } from "./type";

export const MusicItemCard = ({ item, rank, showAction }: Props) => {
  return (
    <article className="flex items-center space-x-2 py-4 sm:space-x-4">
      {rank && <Rank rank={rank} />}
      <Image src={item.image} alt={item.name} />
      <Content item={item} />
      <Stats stat1={item.stat1} stat2={item.stat2} />
      {showAction && <Action />}
    </article>
  );
};
