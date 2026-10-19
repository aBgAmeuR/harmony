import { SidebarTrigger } from "@harmony/ui/components/sidebar";

import { DateRangeFilter } from "@/features/filter-period";
import { Grid } from "@/shared/primitives/grid";
import { Pane } from "@/shared/primitives/pane";
import { Section } from "@/shared/primitives/section";
import { Toolbar } from "@/shared/primitives/toolbar";
import { HighlightsWidget } from "@/widgets/overview/highlights-widget";
import { KpiChartWidget } from "@/widgets/overview/kpi-chart-widget";
import { TopWidget } from "@/widgets/overview/top-widget";

export const OverviewPage = () => (
  <Pane>
    <Pane.Header>
      <SidebarTrigger className="-ml-2 md:hidden" />
      <Pane.Title>Overview</Pane.Title>
      <Toolbar.End>
        <DateRangeFilter />
      </Toolbar.End>
    </Pane.Header>
    <Pane.Body width="lg" className="space-y-8 pb-10">
      <KpiChartWidget />
      <HighlightsWidget />
      <Grid cols={3} className="gap-8">
        <TopWidget by="track" />
        <TopWidget by="album" />
        <TopWidget by="artist" />
      </Grid>
      <Section>
        <Section.Head>
          <Section.Title>Habits</Section.Title>
        </Section.Head>
        {/* <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <HabitsWidget />
          </div>
          <BehaviorWidget />
        </div> */}
      </Section>
    </Pane.Body>
  </Pane>
);
