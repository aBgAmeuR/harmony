import { StaticChartPreviewProvider } from "@harmony/charts";
import { createFileRoute } from "@tanstack/react-router";

import { Header } from "@/components/layout/header/header";
import { ActiveDaysWidget } from "@/features/listening/widgets/active-days-widget";
import { DaysOfWeekWidget } from "@/features/listening/widgets/days-of-week-widget";
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

export const Route = createFileRoute("/app/$packageId/listening")({
  ssr: false,
  loader: async ({ context: { queryClient }, parentMatchPromise }) => {
    await parentMatchPromise;
    await Promise.all([
      queryClient.ensureQueryData(query.listeningHabits.listeningTime.queryOptions()),
      queryClient.ensureQueryData(query.listeningHabits.totalStreams.queryOptions()),
      queryClient.ensureQueryData(query.listeningHabits.activeDays.queryOptions()),
      queryClient.ensureQueryData(query.listeningHabits.uniqueTracks.queryOptions()),
      queryClient.ensureQueryData(query.listeningHabits.monthlyActivity.queryOptions()),
      queryClient.ensureQueryData(query.listeningHabits.daysOfWeek.queryOptions()),
    ]);
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Header title="Listening Habits" />
      <StaticChartPreviewProvider>
        <main className="mx-auto max-w-7xl 2xl:border-x 2xl:border-border">
          <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-x lg:grid-cols-4 lg:divide-y-0">
            <ListeningTimeWidget />
            <TotalStreamsWidget />
            <ActiveDaysWidget />
            <UniqueTracksWidget />
          </div>
          <div className="grid grid-cols-1 divide-y divide-border border-t border-border sm:grid-cols-[3fr_1fr] sm:divide-x sm:divide-y-0">
            <MonthlyActivityWidget />
            <DaysOfWeekWidget />
          </div>
          {/* <div className="border-t border-border">
          <WhenYouListenWidget />
        </div> */}
          <div className="grid grid-cols-1 divide-y divide-border border-t border-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <PeakHoursWidget />
            <PlatformsWidget />
          </div>
          <div className="grid grid-cols-1 divide-y divide-border border-t border-border md:grid-cols-[1fr_2fr] md:divide-x md:divide-y-0">
            <ListeningStyleWidget />
            <TrackEngagementWidget />
          </div>
          <div className="grid grid-cols-1 divide-y divide-border border-t border-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <ReleaseYearWidget />
            <GenresWidget />
          </div>
        </main>
      </StaticChartPreviewProvider>
    </div>
  );
}
