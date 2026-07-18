import { createFileRoute } from "@tanstack/react-router";

import { Header } from "@/components/layout/header/header";
import { ActiveDaysWidget } from "@/features/listening/widgets/active-days-widget";
import { GenresWidget } from "@/features/listening/widgets/genres-widget";
import { ListeningStyleWidget } from "@/features/listening/widgets/listening-style-widget";
import { ListeningTimeWidget } from "@/features/listening/widgets/listening-time-widget";
import { MonthlyActivityWidget } from "@/features/listening/widgets/monthly-activity-widget";
import { PeakHoursWidget } from "@/features/listening/widgets/peak-hours-widget";
import { PlatformsWidget } from "@/features/listening/widgets/platforms-widget";
import { ReleaseYearWidget } from "@/features/listening/widgets/release-year-widget";
import { TotalStreamsWidget } from "@/features/listening/widgets/total-streams-widget";
import { TrackEngagementWidget } from "@/features/listening/widgets/track-engagement-widget";
import { UniqueTracksWidget } from "@/features/listening/widgets/unique-tracks-widget";
import { query } from "@/lib/query";
import { useArtistStore } from "@/lib/stores/artist-store";
import { buildInstantRangeQuery, useDateRangeStore } from "@/lib/stores/date-range-store";

export const Route = createFileRoute("/app/$packageId/listening")({
  ssr: false,
  loader: async ({ context: { queryClient }, parentMatchPromise }) => {
    await parentMatchPromise;
    const artistId = useArtistStore.getState().artist?.id;
    const { from, to } = buildInstantRangeQuery(useDateRangeStore.getState());
    const filter = { artistId, from, to };
    await Promise.all([
      queryClient.ensureQueryData(query.listeningHabits.listeningTime.queryOptions(filter)),
      queryClient.ensureQueryData(query.listeningHabits.totalStreams.queryOptions(filter)),
      queryClient.ensureQueryData(query.listeningHabits.activeDays.queryOptions(filter)),
      queryClient.ensureQueryData(query.listeningHabits.uniqueTracks.queryOptions(filter)),
      queryClient.ensureQueryData(query.listeningHabits.monthlyActivity.queryOptions(filter)),
      queryClient.ensureQueryData(query.listeningHabits.daysOfWeek.queryOptions()),
    ]);
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Header title="Listening Habits" />
      <main className="mx-auto max-w-7xl space-y-3 p-4 pt-0">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <ListeningTimeWidget />
          <TotalStreamsWidget />
          <ActiveDaysWidget />
          <UniqueTracksWidget />
          <div className="col-span-2 lg:col-span-3 lg:row-start-2">
            <MonthlyActivityWidget />
          </div>
          <div className="col-span-2 h-full self-start lg:col-span-1 lg:col-start-4 lg:row-start-2">
            {/* <DaysOfWeekWidget /> */}
          </div>
        </div>

        {/* <WhenYouListenWidget /> */}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <PeakHoursWidget />
          <PlatformsWidget />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_2fr]">
          <ListeningStyleWidget />
          <TrackEngagementWidget />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ReleaseYearWidget />
          <GenresWidget />
        </div>
      </main>
    </div>
  );
}
