import { DateRangeFilter } from "@/features/filter-period";
import { Grid } from "@/shared/primitives/grid";
import { Pane } from "@/shared/primitives/pane";
import { Toolbar } from "@/shared/primitives/toolbar";
import { ActiveDaysWidget } from "@/widgets/listening/active-days-widget";
import { HowYouListenWidget } from "@/widgets/listening/how-you-listen-widget";
import { ListeningLede } from "@/widgets/listening/lede";
import { ListeningTimeWidget } from "@/widgets/listening/listening-time-widget";
import { MonthlyActivityWidget } from "@/widgets/listening/monthly-activity-widget";
import { ReplaysWidget } from "@/widgets/listening/replays-widget";
import { RhythmWidget } from "@/widgets/listening/rhythm-widget";
import { TotalStreamsWidget } from "@/widgets/listening/total-streams-widget";
import { UniqueTracksWidget } from "@/widgets/listening/unique-tracks-widget";
import { WhatYouListenWidget } from "@/widgets/listening/what-you-listen-widget";

export const ListeningPage = () => {
  return (
    <Pane>
      <Pane.Header>
        <Pane.Title>Listening Habits</Pane.Title>
        <Toolbar.End>
          <DateRangeFilter />
        </Toolbar.End>
      </Pane.Header>
      <Pane.Body width="column" className="space-y-8">
        <div className="space-y-2">
          <ListeningLede />
          <Grid cols={4}>
            <ListeningTimeWidget />
            <TotalStreamsWidget />
            <ActiveDaysWidget />
            <UniqueTracksWidget />
          </Grid>
        </div>
        <MonthlyActivityWidget />
        <RhythmWidget />
        <HowYouListenWidget />
        <WhatYouListenWidget />
        <ReplaysWidget />
      </Pane.Body>
    </Pane>
  );
};
