import { BehavioralWidget } from "./behavioral-widget";
import { DevicesWidget } from "./devices-widget";
import { HistoryWidget } from "./history-widget";
import { ListeningWidget } from "./listening-widget";
import { OverviewWidget } from "./overview-widget";
import { VsAverageWidget } from "./vs-average-widget";

type OverviewProps = {
  trackId: number;
};

export const Overview = ({ trackId }: OverviewProps) => {
  return (
    <div className="flex flex-col gap-3 pb-3">
      <OverviewWidget trackId={trackId} />
      <HistoryWidget trackId={trackId} />
      <ListeningWidget trackId={trackId} />
      <BehavioralWidget trackId={trackId} />
      <VsAverageWidget trackId={trackId} />
      <DevicesWidget trackId={trackId} />
    </div>
  );
};
