import { ArrowExpandIcon, Icon } from "@harmony/icons";
import { Button } from "@harmony/ui/components/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@harmony/ui/components/card";
import { useQuery } from "@tanstack/react-query";

import { Metric } from "@/components/metric";
import { useArtistStore } from "@/lib/stores/artist-store";
import { useInstantRangeQuery } from "@/lib/stores/date-range-store";

import { listeningQueries } from "../queries";
import { MetricSparkline } from "./metric-sparkline";

type ListeningMetricQuery = (typeof listeningQueries)[
  | "listeningTime"
  | "totalStreams"
  | "activeDays"
  | "uniqueTracks"];

type MetricCardProps = {
  label: string;
  unit?: string;
  query: ListeningMetricQuery;
};

export const MetricCard = ({ label, unit, query }: MetricCardProps) => {
  const artistId = useArtistStore((s) => s.artist?.id);
  const { from, to } = useInstantRangeQuery();
  const { data } = useQuery(query.queryOptions({ artistId, from, to }));

  return (
    <Card size="xs">
      <CardHeader className="gap-0 px-3 pt-3">
        <div className="flex flex-col">
          <CardTitle className="text-muted-foreground">{label}</CardTitle>
          <Metric size="lg" value={data?.value} unit={unit} />
        </div>
        <CardAction>
          <Button variant="ghost" size="icon" className="-me-1! -mt-1!">
            <Icon icon={ArrowExpandIcon} />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <MetricSparkline trend={data?.trend} />
      </CardContent>
    </Card>
  );
};
