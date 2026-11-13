import { useDetail } from "@/features/detail-panel";
import { useOpen } from "@/widgets/base/open";
import { ExploreLinks } from "@/widgets/overview/explore-links";
import { HighlightsWidget } from "@/widgets/overview/highlights-widget";
import { KpiChartWidget } from "@/widgets/overview/kpi-chart-widget";
import { OverviewLede } from "@/widgets/overview/lede";
import { TopWidget } from "@/widgets/overview/top-widget";
import { Page } from "@/widgets/page/page";

const OPENS = { tracks: "track", albums: "album", artists: "artist" } as const;

export const OverviewPage = () => {
  const { current } = useDetail();
  const open = useOpen();

  return (
    <Page title="Overview" className="space-y-12">
      <div className="space-y-6">
        <OverviewLede />
        <KpiChartWidget />
      </div>
      <HighlightsWidget />
      <TopWidget
        selected={(by, row) => current?.kind === OPENS[by] && current.id === row.id}
        onOpen={(by, row) => open(OPENS[by], row)}
      />
      <ExploreLinks />
    </Page>
  );
};
