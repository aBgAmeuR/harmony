import { DateRangeFilter } from "@/features/filter-period";
import { ArtistsSelect } from "@/features/pick-artist";
import { Pane } from "@/shared/primitives/pane";
import { WeeklyListeningVsReleasesWidget } from "@/widgets/discoveries/weekly-listening-vs-releases-widget";

export const DiscoveriesPage = () => {
  return (
    <Pane>
      <Pane.Header>
        <Pane.Title>Discoveries</Pane.Title>
        <Pane.Sep />
        <ArtistsSelect />
        <Pane.Actions>
          <DateRangeFilter />
        </Pane.Actions>
      </Pane.Header>
      <main className="mx-auto max-w-7xl space-y-3 p-4 pt-0">
        <WeeklyListeningVsReleasesWidget />
      </main>
    </Pane>
  );
};
