import { useParams } from "@tanstack/react-router";

import { ItemBase, ItemPage } from "@/widgets/item/item-page";

export const ArtistPage = () => {
  const { artistId } = useParams({ from: "/app/$packageId/artists/$artistId" });
  const item = { kind: "artist", id: Number(artistId) } as const;

  return (
    <ItemPage item={item}>
      <ItemBase title="Top tracks" item={item} initial={{ base: "tracks" }} />
      <ItemBase title="Albums" item={item} initial={{ base: "albums", view: "gallery" }} />
    </ItemPage>
  );
};
