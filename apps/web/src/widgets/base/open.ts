import { useNavigate, useParams } from "@tanstack/react-router";

import type { ListRow, Opens } from "@/data/bases";

import { UNKNOWN_ALBUM } from "@/data/aggregate";
import { useTrackPanel } from "@/features/track-panel";

// Opens what a row stands for: an item page or the track panel.
export const useOpen = () => {
  const { packageId = "" } = useParams({ strict: false });
  const navigate = useNavigate();
  const { setTrack } = useTrackPanel();

  return (opens: Opens, row: Pick<ListRow, "id" | "track">) => {
    const id = String(row.id);
    switch (opens) {
      case "track":
        void setTrack(Number(row.track ?? row.id));
        return;
      case "artist":
        void navigate({
          to: "/app/$packageId/artists/$artistId",
          params: { packageId, artistId: id },
        });
        return;
      case "album":
        if (row.id === UNKNOWN_ALBUM) return;
        void navigate({
          to: "/app/$packageId/albums/$albumId",
          params: { packageId, albumId: id },
        });
        return;
      case "genre":
        void navigate({ to: "/app/$packageId/genres/$genre", params: { packageId, genre: id } });
        return;
    }
  };
};
