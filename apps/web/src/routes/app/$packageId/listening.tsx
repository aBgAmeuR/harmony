import { createFileRoute } from "@tanstack/react-router";

import { Header } from "@/components/layout/header/header";
import { query } from "@/lib/query";

import { ListeningTimeWidget } from "@/features/listening/widgets/listening-time-widget";
import { TotalStreamsWidget } from "@/features/listening/widgets/total-streams-widget";
import { ActiveDaysWidget } from "@/features/listening/widgets/active-days-widget";
import { UniqueTracksWidget } from "@/features/listening/widgets/unique-tracks-widget";

const listeningTimeQuery = query.listeningHabits.listeningTime.queryOptions();
const totalStreamsQuery = query.listeningHabits.totalStreams.queryOptions();
const activeDaysQuery = query.listeningHabits.activeDays.queryOptions();
const uniqueTracksQuery = query.listeningHabits.uniqueTracks.queryOptions();

export const Route = createFileRoute("/app/$packageId/listening")({
  loader: async ({ context: { queryClient }, parentMatchPromise }) => {
    await parentMatchPromise;
    await Promise.all([
      queryClient.ensureQueryData(listeningTimeQuery),
      queryClient.ensureQueryData(totalStreamsQuery),
      queryClient.ensureQueryData(activeDaysQuery),
      queryClient.ensureQueryData(uniqueTracksQuery),
    ]);
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Header title="Listening Habits" />
      <main className="2xl:border-x 2xl:border-border mx-auto max-w-(--breakpoint-2xl)">
        <div className="grid grid-cols-1 divide-y divide-border rounded-none border-t border-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          <ListeningTimeWidget />
          <TotalStreamsWidget />
          <ActiveDaysWidget />
          <UniqueTracksWidget />
        </div>
        <div className="border-t border-border"></div>
      </main>
    </div>
  );
}
