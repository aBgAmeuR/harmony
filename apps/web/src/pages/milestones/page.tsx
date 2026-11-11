import { FirstsWidget } from "@/widgets/milestones/firsts-widget";
import { NextMilestonesWidget } from "@/widgets/milestones/next-milestones-widget";
import { SessionsStreaksWidget } from "@/widgets/milestones/sessions-streaks-widget";
import { SummaryHero } from "@/widgets/milestones/summary-hero";
import { TimelineWidget } from "@/widgets/milestones/timeline-widget";
import { Page } from "@/widgets/page/page";

export const MilestonesPage = () => {
  return (
    <Page title="Milestones" className="space-y-10">
      <SummaryHero />
      <NextMilestonesWidget />
      <SessionsStreaksWidget />
      <TimelineWidget />
      <FirstsWidget />
    </Page>
  );
};
