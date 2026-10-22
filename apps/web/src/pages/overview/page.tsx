import { SidebarTrigger } from "@harmony/ui/components/sidebar";
import { useNavigate, useParams } from "@tanstack/react-router";

import type { RankBy, RankRow } from "@/data/rank";

import { DateRangeFilter } from "@/features/filter-period";
import { Pane } from "@/shared/primitives/pane";
import { Toolbar } from "@/shared/primitives/toolbar";
import { ExploreLinks } from "@/widgets/overview/explore-links";
import { HighlightsWidget } from "@/widgets/overview/highlights-widget";
import { KpiChartWidget } from "@/widgets/overview/kpi-chart-widget";
import { OverviewLede } from "@/widgets/overview/lede";
import { TopWidget } from "@/widgets/overview/top-widget";
import { TrackSheet } from "@/widgets/track-details/track-sheet";
import { useTrackPanel } from "@/widgets/track-details/use-track-panel";

export const OverviewPage = () => {
  const { packageId } = useParams({ from: "/app/$packageId/" });
  const navigate = useNavigate();
  const { trackId, setTrack } = useTrackPanel();

  // Tracks open in the side panel, artists and albums on their own page.
  const open = (by: RankBy, row: RankRow) => {
    if (by === "track") return setTrack(row.id);
    // Tracks without an album come back with no album ID.
    if (!row.id) return;
    const id = String(row.id);
    return by === "artist"
      ? navigate({ to: "/app/$packageId/artists/$artistId", params: { packageId, artistId: id } })
      : navigate({ to: "/app/$packageId/albums/$albumId", params: { packageId, albumId: id } });
  };

  return (
    <Pane>
      <Pane.Header>
        <SidebarTrigger className="-ml-2 md:hidden" />
        <Pane.Title>Overview</Pane.Title>
        <Toolbar.End>
          <DateRangeFilter />
        </Toolbar.End>
      </Pane.Header>
      <Pane.Body width="column" className="space-y-12">
        <div className="space-y-6">
          <OverviewLede />
          <KpiChartWidget />
        </div>
        <HighlightsWidget />
        <TopWidget selectedId={trackId} onOpen={open} />
        <ExploreLinks />
      </Pane.Body>
      <TrackSheet />
    </Pane>
  );
};
