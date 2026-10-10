import { DateRangeFilter } from "@/features/filter-period";
import { ArtistsSelect } from "@/features/pick-artist";
import { Pane } from "@/shared/primitives/pane";
import { FirstsWidget } from "@/widgets/milestones/firsts-widget";
import { NextMilestonesWidget } from "@/widgets/milestones/next-milestones-widget";
import { SessionsStreaksWidget } from "@/widgets/milestones/sessions-streaks-widget";
import { SummaryHero } from "@/widgets/milestones/summary-hero";
import { TimelineWidget } from "@/widgets/milestones/timeline-widget";

export const MilestonesPage = () => {
  return (
    <Pane>
      <Pane.Header>
        <Pane.Title>Milestones</Pane.Title>
        <Pane.Sep />
        <ArtistsSelect />
        <Pane.Actions>
          <DateRangeFilter />
        </Pane.Actions>
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
};
