import { DateRangeFilter } from "@/features/filter-period";
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
        <Toolbar.End>
          <DateRangeFilter />
        </Toolbar.End>
      </Pane.Header>
      <Pane.Body width="column" className="space-y-10">
        <SummaryHero />
        <NextMilestonesWidget />
        <SessionsStreaksWidget />
        <TimelineWidget />
        <FirstsWidget />
      </Pane.Body>
    </Pane>
  );
};
