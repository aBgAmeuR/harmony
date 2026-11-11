import type { TopRow } from "@/data/bases";

import { useTrackPanel } from "@/features/track-panel";
import { useOpen } from "@/widgets/base/open";
import { ExploreLinks } from "@/widgets/overview/explore-links";
import { HighlightsWidget } from "@/widgets/overview/highlights-widget";
import { KpiChartWidget } from "@/widgets/overview/kpi-chart-widget";
import { OverviewLede } from "@/widgets/overview/lede";
import { TopWidget } from "@/widgets/overview/top-widget";
import { Page } from "@/widgets/page/page";
import { TrackSheet } from "@/widgets/track-details/track-sheet";

const OPENS = { tracks: "track", albums: "album", artists: "artist" } as const;

export const OverviewPage = () => {
  const { trackId } = useTrackPanel();
  const open = useOpen();

  return (
    <Page title="Overview" className="space-y-12" aside={<TrackSheet />}>
      <div className="space-y-6">
        <OverviewLede />
        <KpiChartWidget />
      </div>
      <HighlightsWidget />
      <TopWidget
        selectedId={trackId}
        onOpen={(by: keyof typeof OPENS, row: TopRow) => open(OPENS[by], row)}
      />
      <ExploreLinks />
    </Page>
  );
};
