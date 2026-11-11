import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";

import { useTrackPanel } from "@/features/track-panel";
import { usePeriod } from "@/shared/scope";
import { AlbumTracks } from "@/widgets/item/album-tracks";
import { itemQueries } from "@/widgets/item/api";
import { ItemPage } from "@/widgets/item/item-page";

export const AlbumPage = () => {
  const { albumId } = useParams({ from: "/app/$packageId/albums/$albumId" });
  const item = { kind: "album", id: Number(albumId) } as const;
  const range = usePeriod();
  const { trackId, setTrack } = useTrackPanel();
  const { data: tracks = [] } = useQuery(itemQueries.albumTracks({ albumId: item.id, range }));

  return (
    <ItemPage item={item}>
      <AlbumTracks tracks={tracks} selectedId={trackId} onOpen={(track) => setTrack(track.id)} />
    </ItemPage>
  );
};
