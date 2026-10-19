import { useNavigate, useParams, useSearch } from "@tanstack/react-router";

import { DateRangeFilter } from "@/features/filter-period";
import { ArtistsSelect } from "@/features/pick-artist";
import { Pane } from "@/shared/primitives/pane";
import { Toolbar } from "@/shared/primitives/toolbar";
import { Explorer } from "@/widgets/explorer/explorer";
import { DEFAULT_TAB, type ExplorerSearch } from "@/widgets/explorer/search";
import { TrackSheet } from "@/widgets/track-details/track-sheet";

const FROM = "/app/$packageId/explorer";

export const ExplorerPage = () => {
  const { packageId } = useParams({ from: FROM });
  const search = useSearch({ from: FROM });
  const navigate = useNavigate({ from: FROM });

  const change = (patch: ExplorerSearch, replace = false) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace });

  const openEntity = (tab: "artists" | "albums", id: number) =>
    tab === "artists"
      ? navigate({
          to: "/app/$packageId/artists/$artistId",
          params: { packageId, artistId: String(id) },
        })
      : navigate({
          to: "/app/$packageId/albums/$albumId",
          params: { packageId, albumId: String(id) },
        });

  return (
    <Pane>
      <Pane.Header>
        <Pane.Title>Explorer</Pane.Title>
        {(search.tab ?? DEFAULT_TAB) === "artists" ? null : (
          <>
            <Toolbar.Sep />
            <ArtistsSelect hotkey />
          </>
        )}
        <Toolbar.End>
          <DateRangeFilter />
        </Toolbar.End>
      </Pane.Header>
      <Explorer search={search} onChange={change} onOpenEntity={openEntity} />
      <TrackSheet />
    </Pane>
  );
};
