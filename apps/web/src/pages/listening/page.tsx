import { Grid } from "@/shared/primitives/grid";
import { HowYouListenWidget } from "@/widgets/listening/how-you-listen-widget";
import { ListeningLede } from "@/widgets/listening/lede";
import { MonthlyActivityWidget } from "@/widgets/listening/monthly-activity-widget";
import { ReplaysWidget } from "@/widgets/listening/replays-widget";
import { RhythmWidget } from "@/widgets/listening/rhythm-widget";
import { MetricCard } from "@/widgets/listening/ui/metric-card";
import { WhatYouListenWidget } from "@/widgets/listening/what-you-listen-widget";
import { Page } from "@/widgets/page/page";

export const ListeningPage = () => (
  <Page title="Listening Habits" className="space-y-8">
    <div className="space-y-2">
      <ListeningLede />
      <Grid cols={4}>
        <MetricCard measure="playtime" />
        <MetricCard measure="streams" />
        <MetricCard measure="days" />
        <MetricCard measure="tracks" />
      </Grid>
    </div>
    <MonthlyActivityWidget />
    <RhythmWidget />
    <HowYouListenWidget />
    <WhatYouListenWidget />
    <ReplaysWidget />
  </Page>
);
