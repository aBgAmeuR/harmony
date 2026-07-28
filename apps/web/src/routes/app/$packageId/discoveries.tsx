import { createFileRoute } from "@tanstack/react-router";

import { DateRangeFilter } from "@/components/layout/header/date-range-filter";
import { Pane } from "@/components/pane";
import { WeeklyListeningVsReleasesWidget } from "@/features/discoveries/widgets/weekly-listening-vs-releases-widget";
import { readFilter } from "@/lib/filter";
import { query } from "@/lib/query";

export const Route = createFileRoute("/app/$packageId/discoveries")({
  ssr: false,
  loader: async ({ context: { queryClient }, parentMatchPromise }) => {
    await parentMatchPromise;
    const filter = readFilter();
    if (filter.artistId == null) return;

    await Promise.all([
      queryClient.ensureQueryData(query.discoveries.weeklyActivity.queryOptions(filter)),
      queryClient.ensureQueryData(query.discoveries.artistReleases.queryOptions(filter)),
    ]);
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Pane>
      <Pane.Header title="Discoveries" artistSelect>
        <DateRangeFilter />
      </Pane.Header>
      <main className="mx-auto max-w-7xl space-y-3 p-4 pt-0">
        <WeeklyListeningVsReleasesWidget />
      </main>
    </Pane>
  );
}
