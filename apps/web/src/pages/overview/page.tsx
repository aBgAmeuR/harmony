import { useDetail } from "@/features/detail-panel";
import { useOpen } from "@/widgets/base/open";
import { HighlightsWidget } from "@/widgets/overview/highlights-widget";
import { KpiStrip } from "@/widgets/overview/kpi-strip";
import { OverviewLede } from "@/widgets/overview/lede";
import { TopWidget } from "@/widgets/overview/top-widget";
import { Page } from "@/widgets/page/page";

const OPENS = { tracks: "track", albums: "album", artists: "artist" } as const;

export const OverviewPage = () => {
  const { current } = useDetail();
  const open = useOpen();

  return (
    <Page title="Overview" width="wide" className="space-y-8">
      <div className="space-y-4">
        <OverviewLede />
        <KpiStrip />
      </div>
      <HighlightsWidget />
      <TopWidget
        selected={(by, row) => current?.kind === OPENS[by] && current.id === row.id}
        onOpen={(by, row) => open(OPENS[by], row)}
      />
    </Page>
  );
};
