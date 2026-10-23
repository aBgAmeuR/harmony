import { DateRangeFilter } from "@/features/filter-period";
import { Pane } from "@/shared/primitives/pane";
import { Toolbar } from "@/shared/primitives/toolbar";
import { DiscoveriesLede } from "@/widgets/discoveries/lede";
import { WeeklyListeningVsReleasesWidget } from "@/widgets/discoveries/weekly-listening-vs-releases-widget";

export const DiscoveriesPage = () => {
  return (
    <Pane>
      <Pane.Header>
        <Pane.Title>Discoveries</Pane.Title>
        <Toolbar.End>
          <DateRangeFilter />
        </Toolbar.End>
      </Pane.Header>
      <Pane.Body width="column" className="space-y-6">
        <DiscoveriesLede />
        <WeeklyListeningVsReleasesWidget />
      </Pane.Body>
    </Pane>
  );
};
