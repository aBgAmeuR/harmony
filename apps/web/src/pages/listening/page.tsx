import { DateRangeFilter } from "@/features/filter-period";
import { ArtistsSelect } from "@/features/pick-artist";
import { Pane } from "@/shared/primitives/pane";
import { ActiveDaysWidget } from "@/widgets/listening/active-days-widget";
import { DaysOfWeekWidget } from "@/widgets/listening/days-of-week-widget";
import { ListeningTimeWidget } from "@/widgets/listening/listening-time-widget";
import { MonthlyActivityWidget } from "@/widgets/listening/monthly-activity-widget";
import { TotalStreamsWidget } from "@/widgets/listening/total-streams-widget";
import { UniqueTracksWidget } from "@/widgets/listening/unique-tracks-widget";

export const ListeningPage = () => {
  return (
    <Pane>
      <Pane.Header>
        <Pane.Title>Listening Habits</Pane.Title>
        <Pane.Sep />
        <ArtistsSelect />
        <Pane.Actions>
          <DateRangeFilter />
        </Pane.Actions>
      </Pane.Header>
      <main className="mx-auto max-w-7xl space-y-3 p-4 pt-0">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <ListeningTimeWidget />
          <TotalStreamsWidget />
          <ActiveDaysWidget />
          <UniqueTracksWidget />
          <div className="col-span-2 lg:col-span-3 lg:row-start-2">
            <MonthlyActivityWidget />
          </div>
          <div className="col-span-2 h-full self-start lg:col-span-1 lg:col-start-4 lg:row-start-2">
            <DaysOfWeekWidget />
          </div>
        </div>

        {/* <WhenYouListenWidget /> */}

        {/* <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <PeakHoursWidget />
          <PlatformsWidget />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_2fr]">
          <ListeningStyleWidget />
          <TrackEngagementWidget />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ReleaseYearWidget />
          <GenresWidget />
        </div> */}
      </main>
    </Pane>
  );
};
