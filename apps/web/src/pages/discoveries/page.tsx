import { DateRangeFilter } from "@/features/filter-period";
import { ArtistsSelect } from "@/features/pick-artist";
import { Pane } from "@/shared/primitives/pane";
import { Toolbar } from "@/shared/primitives/toolbar";
import { WeeklyListeningVsReleasesWidget } from "@/widgets/discoveries/weekly-listening-vs-releases-widget";

export const DiscoveriesPage = () => {
  return (
    <Pane>
      <Pane.Header>
        <Pane.Title>Discoveries</Pane.Title>
        <Toolbar.Sep />
        <ArtistsSelect />
        <Toolbar.End>
          <DateRangeFilter />
        </Toolbar.End>
      </Pane.Header>
      <Pane.Body width="lg" className="space-y-3">
        <WeeklyListeningVsReleasesWidget />
      </Pane.Body>
    </Pane>
  );
};
