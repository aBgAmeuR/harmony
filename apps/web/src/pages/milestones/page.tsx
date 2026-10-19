import { DateRangeFilter } from "@/features/filter-period";
import { ArtistsSelect } from "@/features/pick-artist";
import { Pane } from "@/shared/primitives/pane";
import { Toolbar } from "@/shared/primitives/toolbar";
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
        <Toolbar.Sep />
        <ArtistsSelect />
        <Toolbar.End>
          <DateRangeFilter />
        </Toolbar.End>
      </Pane.Header>
      <Pane.Body width="lg" className="pt-4">
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
      </Pane.Body>
    </Pane>
  );
};
