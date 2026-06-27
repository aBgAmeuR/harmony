import { createFileRoute } from "@tanstack/react-router";

import { Header } from "@/components/layout/header/header";
import { query } from "@/lib/query";

import { ActiveDaysWidget } from "@/features/listening/widgets/active-days-widget";
import { DaysOfWeekWidget } from "@/features/listening/widgets/days-of-week-widget";
import { ListeningTimeWidget } from "@/features/listening/widgets/listening-time-widget";
import { MonthlyActivityWidget } from "@/features/listening/widgets/monthly-activity-widget";
import { TotalStreamsWidget } from "@/features/listening/widgets/total-streams-widget";
import { UniqueTracksWidget } from "@/features/listening/widgets/unique-tracks-widget";

export const Route = createFileRoute("/app/$packageId/listening")({
  loader: async ({ context: { queryClient }, parentMatchPromise }) => {
    await parentMatchPromise;
    await Promise.all([
      queryClient.ensureQueryData(
        query.listeningHabits.listeningTime.queryOptions(),
      ),
      queryClient.ensureQueryData(
        query.listeningHabits.totalStreams.queryOptions(),
      ),
      queryClient.ensureQueryData(
        query.listeningHabits.activeDays.queryOptions(),
      ),
      queryClient.ensureQueryData(
        query.listeningHabits.uniqueTracks.queryOptions(),
      ),
      queryClient.ensureQueryData(
        query.listeningHabits.monthlyActivity.queryOptions(),
      ),
      queryClient.ensureQueryData(
        query.listeningHabits.daysOfWeek.queryOptions(),
      ),
    ]);
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Header title="Listening Habits" />
      <main className="2xl:border-x 2xl:border-border mx-auto max-w-(--breakpoint-2xl)">
        <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-x lg:divide-y-0 lg:grid-cols-4">
          <ListeningTimeWidget />
          <TotalStreamsWidget />
          <ActiveDaysWidget />
          <UniqueTracksWidget />
        </div>
        <div className="grid grid-cols-1 divide-y divide-border border-t border-border sm:grid-cols-[3fr_1fr] sm:divide-x sm:divide-y-0">
          <MonthlyActivityWidget />
          <DaysOfWeekWidget />
        </div>
        <div className="border-t border-border"></div>
      </main>
    </div>
  );
}
