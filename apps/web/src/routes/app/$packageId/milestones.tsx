import { createFileRoute } from "@tanstack/react-router";

import { DateRangeFilter } from "@/components/layout/header/date-range-filter";
import { Pane } from "@/components/pane";
import { FirstsWidget } from "@/features/milestones/widgets/firsts-widget";
import { NextMilestonesWidget } from "@/features/milestones/widgets/next-milestones-widget";
import { SessionsStreaksWidget } from "@/features/milestones/widgets/sessions-streaks-widget";
import { SummaryHero } from "@/features/milestones/widgets/summary-hero";
import { TimelineWidget } from "@/features/milestones/widgets/timeline-widget";
import { readFilter } from "@/lib/filter";
import { query } from "@/lib/query";

export const Route = createFileRoute("/app/$packageId/milestones")({
  ssr: false,
  loader: async ({ context: { queryClient }, parentMatchPromise }) => {
    await parentMatchPromise;
    const filter = readFilter();
    await Promise.all([
      queryClient.ensureQueryData(query.milestones.summary.queryOptions(filter)),
      queryClient.ensureQueryData(query.milestones.nextMilestones.queryOptions(filter)),
      queryClient.ensureQueryData(query.milestones.streak.queryOptions(filter)),
      queryClient.ensureQueryData(query.milestones.sessions.queryOptions(filter)),
      queryClient.ensureQueryData(query.milestones.timeline.queryOptions(filter)),
      queryClient.ensureQueryData(query.milestones.firsts.queryOptions(filter)),
    ]);
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Pane>
      <Pane.Header title="Milestones" artistSelect>
        <DateRangeFilter />
      </Pane.Header>
      <main className="mx-auto max-w-6xl p-4">
        <SummaryHero />

        <div className="grid grid-cols-1 gap-6 pt-5 md:grid-cols-2">
          <NextMilestonesWidget />
          <SessionsStreaksWidget />
        </div>

        <div className="pt-5">
          <TimelineWidget />
        </div>

        <div className="pt-5">
          <FirstsWidget />
        </div>
      </main>
    </Pane>
  );
}
