import { useParams } from "@tanstack/react-router";

import { ItemBase, ItemPage } from "@/widgets/item/item-page";

export const GenrePage = () => {
  const { genre } = useParams({ from: "/app/$packageId/genres/$genre" });
  const item = { kind: "genre", id: genre } as const;

  return (
    <ItemPage item={item}>
      <ItemBase title="Artists" item={item} initial={{ base: "artists" }} />
      <ItemBase title="Albums" item={item} initial={{ base: "albums", view: "gallery" }} />
      <ItemBase title="Tracks" item={item} initial={{ base: "tracks" }} />
    </ItemPage>
  );
};
