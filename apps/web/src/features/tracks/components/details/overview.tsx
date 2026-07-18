import { BehavioralWidget } from "@/features/tracks/widgets/details/behavioral-widget";
import { DevicesWidget } from "@/features/tracks/widgets/details/devices-widget";
import { HistoryWidget } from "@/features/tracks/widgets/details/history-widget";
import { ListeningWidget } from "@/features/tracks/widgets/details/listening-widget";
import { OverviewWidget } from "@/features/tracks/widgets/details/overview-widget";
import { VsAverageWidget } from "@/features/tracks/widgets/details/vs-average-widget";

type OverviewProps = {
  trackId: number;
};

export function Overview({ trackId }: OverviewProps) {
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
}
